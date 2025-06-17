import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { extractSiteId } from '../utils/siteId';

// Editor components
import Dashboard from './editors/Dashboard';
import GeneralEditor from './editors/GeneralEditor';
import HeroEditor from './editors/HeroEditor';
import AboutEditor from './editors/AboutEditor';
import ServicesEditor from './editors/ServicesEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import GalleryEditor from './editors/GalleryEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';
import FAQEditor from './editors/FAQEditor';
import ContactEditor from './editors/ContactEditor';
import SocialEditor from './editors/SocialEditor';
import ConfigEditor from './editors/ConfigEditor';

import Preview from './Preview';

export default function AdminDashboard() {
  const [clientData, setClientData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [siteId, setSiteId] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const extractedSiteId = extractSiteId();
    setSiteId(extractedSiteId);
    
    // Fetch client data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Not authenticated');
          window.location.href = '/admin';
          return;
        }
        
        console.log('Fetching data for site:', extractedSiteId);
        const response = await fetch(`/api/get-client-data?siteId=${extractedSiteId}`);
        if (!response.ok) {
          throw new Error('Failed to load site data');
        }
        
        const data = await response.json();
        setClientData(data);
        setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy
        setLoading(false);
      } catch (err) {
        console.error('Dashboard data error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Set active section based on URL
    const path = location.pathname.split('/')[2] || 'dashboard';
    setActiveSection(path);
  }, [location]);
  
  // Save changes to Redis
  const handleSave = async () => {
    if (!clientData) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/save-client-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clientData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
      
      setOriginalData(JSON.parse(JSON.stringify(clientData))); // Update original data
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges = () => {
    if (!originalData || !clientData) return false;
    return JSON.stringify(originalData) !== JSON.stringify(clientData);
  }
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'general', label: 'General Settings', path: '/admin/dashboard/general' },
    { id: 'hero', label: 'Hero Section', path: '/admin/dashboard/hero' },
    { id: 'about', label: 'About Section', path: '/admin/dashboard/about' },
    { id: 'services', label: 'Services', path: '/admin/dashboard/services' },
    { id: 'features', label: 'Features', path: '/admin/dashboard/features' },
    { id: 'gallery', label: 'Gallery', path: '/admin/dashboard/gallery' },
    { id: 'testimonials', label: 'Testimonials', path: '/admin/dashboard/testimonials' },
    { id: 'faq', label: 'FAQ', path: '/admin/dashboard/faq' },
    { id: 'contact', label: 'Contact', path: '/admin/dashboard/contact' },
    { id: 'social', label: 'Social Media', path: '/admin/dashboard/social' },
    { id: 'config', label: 'Display Settings', path: '/admin/dashboard/config' },
  ];

  if (loading) return <div className="p-8 text-center">Loading site data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">{clientData.siteTitle} Admin</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={() => window.location.href = '/'} className="text-gray-600 hover:text-gray-800 mr-4">
                View Site
              </button>
              <button onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin';
              }} className="text-gray-600 hover:text-gray-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</h2>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              View Site
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className={`px-4 py-2 rounded-md ${
                hasChanges()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-4">
            <nav className="space-y-1">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={item.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Editing Area */}
            <div className="w-1/2 overflow-y-auto p-6">
              {clientData && (
                <Routes>
                  <Route index element={<Dashboard clientData={clientData} />} />
                  <Route path="general" element={<GeneralEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="hero" element={<HeroEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="about" element={<AboutEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="services" element={<ServicesEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="features" element={<FeaturesEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="gallery" element={<GalleryEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="testimonials" element={<TestimonialsEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="faq" element={<FAQEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="contact" element={<ContactEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="social" element={<SocialEditor clientData={clientData} setClientData={setClientData} />} />
                  <Route path="config" element={<ConfigEditor clientData={clientData} setClientData={setClientData} />} />
                </Routes>
              )}
            </div>
            
            {/* Preview Area */}
            <div className="w-1/2 border-l border-gray-200 overflow-hidden">
              <Preview clientData={clientData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}