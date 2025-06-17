import { useState, useEffect, useRef } from 'react';

export default function Preview({ clientData }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);
  
  const handleRefresh = () => {
    setIframeLoaded(false);
    setRefreshKey(prev => prev + 1);
  };
  
  // Send data whenever clientData changes
  useEffect(() => {
    if (!iframeLoaded || !clientData || !iframeRef.current) return;
    
    console.log('[Preview] Sending updated client data to iframe');
    try {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_CLIENT_DATA',
        clientData: JSON.parse(JSON.stringify(clientData)) // Deep clone to avoid reference issues
      }, '*');
    } catch (err) {
      console.error('[Preview] Error sending data:', err);
    }
  }, [clientData, iframeLoaded]);
  
  // Listen for iframe ready message
  useEffect(() => {
    const handleMessage = (event) => {
      console.log('[Preview] Received message:', event.data);
      if (event.data === 'PREVIEW_LOADED') {
        console.log('[Preview] Iframe reported loaded');
        setIframeLoaded(true);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      <div className="flex-1 overflow-hidden relative">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={refreshKey}
          id="preview-iframe"
          src="/?preview=true"
          className="w-full h-full border-none"
          onLoad={() => console.log('[Preview] Iframe onLoad event fired')}
          title="Site Preview"
        />
      </div>
    </div>
  );
}