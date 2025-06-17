// src/App.jsx
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import FeaturesSection from './components/FeaturesSection'
import GallerySection from './components/GallerySection'
import TestimonialsSection from './components/TestimonialsSection'
import FAQSection from './components/FAQSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import { extractSiteId } from './utils/siteId';
import { initializePreviewDebugging, updatePreviewTitle } from './utils/previewHelpers';

function App() {
  const [content, setContent] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteId, setSiteId] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    initializePreviewDebugging();
  }, []);

  useEffect(() => {
    // Check if we're in preview mode
    const urlParams = new URLSearchParams(window.location.search);
    const previewMode = urlParams.get('preview') === 'true';
    setIsPreview(previewMode);
    
    if (previewMode) {
      console.log('[App] Running in preview mode');
      
      // Initialize with default configuration to avoid null rendering issues
      setConfig({
        primaryColor: 'blue',
        showHero: true,
        showAbout: true,
        showServices: true,
        showFeatures: true,
        showTestimonials: true,
        showGallery: true,
        showContact: true,
        showFAQ: true
      });
      
      // Function to notify parent that the preview is ready
      const notifyReady = () => {
        try {
          window.parent.postMessage('PREVIEW_LOADED', '*');
          console.log('[App] Preview ready message sent');
        } catch (err) {
          console.error('[App] Failed to send ready message:', err);
        }
      };
      
      // Set up listener for content updates
      const handleMessage = (event) => {
        if (event.data?.type === 'UPDATE_CLIENT_DATA' && event.data?.clientData) {
          console.log('[App] Received client data in preview mode');
          
          const newData = event.data.clientData;
          
          // Important: Create brand new object references to force re-render
          setContent({...newData});
          
          // Make sure config is properly updated as well
          if (newData.config) {
            setConfig({...newData.config});
          }
          
          // Update document title
          if (newData.siteTitle) {
            document.title = newData.siteTitle;
          }
          
          setLoading(false);
          console.log('[App] Preview content updated successfully');
        }
      };
      
      // Register the event listener
      window.addEventListener('message', handleMessage);
      
      // Send initial ready notification
      notifyReady();
      
      // Also try again shortly in case the parent wasn't ready
      setTimeout(notifyReady, 500);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
    
    const extractedSiteId = extractSiteId();
    setSiteId(extractedSiteId);
    
    console.log('App loading data for site ID:', extractedSiteId);

    // First try API endpoint with Redis data
    fetch(`/api/get-client-data?siteId=${extractedSiteId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Remote data not available');
        }
        return response.json();
      })
      .then(data => {
        setContent(data);
        if (data.config) {
          setConfig(data.config);
        }
        setLoading(false);
        
        if (data.siteTitle) {
          document.title = data.siteTitle;
        }
      })
      .catch(error => {
        console.warn('API data fetch failed, falling back to local file:', error);
        // Fall back to local client.json
        fetch('/client.json')
          .then(r => r.json())
          .then(client => {
            setContent(client);
            if (client.config) {
              setConfig(client.config);
            }
            setLoading(false);
            
            if (client.siteTitle) {
              document.title = client.siteTitle;
            }
          })
          .catch(err => {
            console.error('Failed to load content:', err);
            setLoading(false);
          });
      });
  }, []);
  
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4' />
          <p className='text-gray-600 text-lg'>Loading…</p>
        </div>
      </div>
    )
  }

  if (!content || !config) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route path="/" element={
          <div className='min-h-screen bg-white scroll-smooth'>
            <Header siteTitle={content.siteTitle} logoUrl={content.logoUrl} config={config} primaryColor={config.primaryColor} />
            <AnimatePresence mode='wait'>
              {config.showHero && (
                <HeroSection key='hero' {...content.hero} primaryColor={config.primaryColor} secondaryColor={config.secondaryColor} animations={config.animations} />
              )}
              {config.showAbout && <AboutSection key='about' {...content.about} primaryColor={config.primaryColor} />}
              {config.showServices && <ServicesSection key='services' {...content.services} primaryColor={config.primaryColor} secondaryColor={config.secondaryColor} />}
              {config.showFeatures && <FeaturesSection key='features' {...content.features} primaryColor={config.primaryColor} />}
              {config.showGallery && <GallerySection key='gallery' {...content.gallery} primaryColor={config.primaryColor} />}
              {config.showTestimonials && <TestimonialsSection key='testimonials' {...content.testimonials} primaryColor={config.primaryColor} />}
              {config.showFAQ && <FAQSection key='faq' {...content.faq} primaryColor={config.primaryColor} />}
              {config.showContact && <ContactSection key='contact' {...content.contact} primaryColor={config.primaryColor} />}
            </AnimatePresence>
            <Footer social={content.social} primaryColor={config.primaryColor} siteTitle={content.siteTitle} />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
