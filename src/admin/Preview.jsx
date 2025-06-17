import { useState, useEffect, useRef } from 'react';

export default function Preview({ clientData }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);
  
  const handleRefresh = () => {
    setIframeLoaded(false);
    setRefreshKey(prev => prev + 1);
  };
  
  // Send data to preview whenever clientData changes
  useEffect(() => {
    if (!iframeLoaded || !clientData) return;
    
    console.log('[Preview] Sending data to iframe');
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_CLIENT_DATA',
        clientData
      }, '*');
    }
  }, [clientData, iframeLoaded]);
  
  // Set up message listener for iframe ready event
  useEffect(() => {
    const handleMessage = (event) => {
      console.log('[Preview] Received message from iframe:', event.data);
      if (event.data === 'PREVIEW_LOADED') {
        console.log('[Preview] Iframe reported loaded');
        setIframeLoaded(true);
        
        // Send initial data
        if (clientData && iframeRef.current) {
          console.log('[Preview] Sending initial data to iframe');
          iframeRef.current.contentWindow.postMessage({
            type: 'UPDATE_CLIENT_DATA',
            clientData
          }, '*');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clientData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-medium">Live Preview</h3>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {!iframeLoaded && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={refreshKey}
          id="preview-iframe"
          src="/?preview=true"
          className="w-full h-full"
          style={{ display: iframeLoaded ? 'block' : 'none' }}
          title="Site Preview"
        />
      </div>
    </div>
  );
}