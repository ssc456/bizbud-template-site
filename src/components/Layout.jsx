import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import { extractSiteId } from '../utils/siteId';

export default function Layout({ children }) {
  const [content, setContent] = useState({});
  const [config, setConfig] = useState({
    primaryColor: 'blue',
  });
  
  useEffect(() => {
    const siteId = extractSiteId();
    
    // Fetch site data
    fetch(`/api/client-data?siteId=${siteId}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) {
          setContent(data);
          if (data.config) setConfig(data.config);
          if (data.siteTitle) document.title = data.siteTitle;
        }
      })
      .catch(err => console.error('Error loading site data:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        siteTitle={content.siteTitle} 
        logoUrl={content.logoUrl} 
        config={config} 
        primaryColor={config.primaryColor} 
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer 
        social={content.social || {}} 
        primaryColor={config.primaryColor} 
        siteTitle={content.siteTitle} 
      />
    </div>
  );
}