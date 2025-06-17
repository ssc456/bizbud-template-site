import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
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
import MediaLibrary from './editors/MediaLibrary';

import PreviewFrame from './PreviewFrame';
import DebugConsole from './DebugConsole';

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

  // Get the site ID and fetch initial data
  useEffect(() => {
    const extractedSiteId = extractSiteId();
    setSiteId(extractedSiteId);
    
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
  
  // Update active section when URL changes
  useEffect(() => {
    const path = location.pathname;
    const section = path.split('/').pop() || 'dashboard';
    setActiveSection(section);
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
    { id: 'media', label: 'Media Library', path: '/admin/dashboard/media' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ToastContainer position="top-right" />
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {navItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  activeSection === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700"
          >
            View Site
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin';
            }}
            className="w-full px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 mt-2"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</h2>
          
          <div className="flex items-center gap-3">
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
                <Route path="media" element={<MediaLibrary />} />
              </Routes>
            )}
          </div>
          
          {/* Preview Area */}
          <div className="w-1/2 border-l border-gray-200 overflow-hidden">
            <PreviewFrame clientData={clientData} />
          </div>
        </div>
      </div>
      
      <DebugConsole />
    </div>
  );
}