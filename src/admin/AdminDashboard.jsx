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
import AppointmentsManager from './editors/appointments/AppointmentsManager';
import InvoiceEditor from './editors/InvoiceEditor';

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
  // Add state for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the site ID and fetch initial data
  useEffect(() => {
    if (location.pathname === '/admin/dashboard/sites') {
      setLoading(false);
      return;
    }
    
    const extractedSiteId = extractSiteId();
    setSiteId(extractedSiteId);
    
    const fetchData = async () => {
      try {
        const extractedSiteId = extractSiteId();
        
        // Get CSRF token from sessionStorage
        const csrfToken = sessionStorage.getItem('csrfToken');
        
        // Verify token is valid for this site
        const validateResponse = await fetch(`/api/auth?action=validate&siteId=${extractedSiteId}`, {
          credentials: 'include', // Important for cookies
          headers: {
            'X-CSRF-Token': csrfToken || ''
          }
        });
        
        if (!validateResponse.ok) {
          // Force logout if token isn't valid for this site
          window.location.href = '/admin';
          return;
        }
        
        // Continue with data fetching
        const response = await fetch(`/api/client-data?siteId=${extractedSiteId}`, {
          credentials: 'include', // Important for cookies
          headers: {
            'X-CSRF-Token': csrfToken || ''
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load site data');
        }
        
        const data = await response.json();
        setClientData(data);
        setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy
      } catch (err) {
        console.error('Dashboard data error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]);
  
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
      // Get CSRF token from sessionStorage
      const csrfToken = sessionStorage.getItem('csrfToken');
      
      const response = await fetch('/api/client-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        credentials: 'include', // Important for cookies
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
    { 
      id: 'appointments', 
      label: 'Appointment Manager', 
      path: '/admin/appointments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'invoicing', 
      label: 'Invoicing',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: () => navigate('/admin/invoices'),
    }
  ];

  const handleLogout = async () => {
    try {
      const csrfToken = sessionStorage.getItem('csrfToken');
      
      // Call logout API
      await fetch('/api/auth?action=logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        credentials: 'include'
      });
      
      // Clear client-side storage
      sessionStorage.removeItem('csrfToken');
      
      // Redirect to login
      window.location.href = '/admin';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just redirect
      window.location.href = '/admin';
    }
  };

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
              item.path ? (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    activeSection === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex items-center px-4 py-2 text-sm rounded-md w-full text-left ${
                    activeSection === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
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
            onClick={handleLogout}
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
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Editing Area */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6">
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
                <Route path="appointments" element={<AppointmentsManager />} />
                <Route path="invoicing" element={<InvoiceEditor />} />
              </Routes>
            )}
          </div>
          
          {/* Preview Area - Hidden on mobile by default */}
          <div className="hidden lg:block lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-hidden">
            <PreviewFrame clientData={clientData} />
          </div>
          
          {/* Mobile Preview Toggle Button */}
          <div className="fixed bottom-4 right-4 lg:hidden">
            <button 
              onClick={() => setShowMobilePreview(prev => !prev)} 
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
              aria-label="Toggle preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Preview Modal */}
          {showMobilePreview && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 lg:hidden flex flex-col">
              <div className="bg-white p-2 flex justify-between items-center">
                <h3 className="text-lg font-medium">Preview</h3>
                <button 
                  onClick={() => setShowMobilePreview(false)}
                  className="p-2 rounded-md text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PreviewFrame clientData={clientData} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <DebugConsole />
    </div>
  );
}