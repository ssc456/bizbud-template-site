import { useState, useEffect } from 'react';

export default function Preview({ clientData }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const handleRefresh = () => {
    setIframeLoaded(false);
    setRefreshKey(prev => prev + 1);
  };
  
  useEffect(() => {
    // Set up message event to notify iframe when it's loaded
    const handleMessage = (event) => {
      if (event.data === 'PREVIEW_LOADED') {
        setIframeLoaded(true);
        
        // Send the client data to the iframe
        const iframe = document.getElementById('preview-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'UPDATE_CLIENT_DATA',
            clientData
          }, '*');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clientData]);
  
  // Listen for preview update events from forms
  useEffect(() => {
    const handlePreviewUpdate = (event) => {
      const iframe = document.getElementById('preview-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'UPDATE_CLIENT_DATA',
          clientData: event.detail.data
        }, '*');
      }
    };
    
    window.addEventListener('adminPreviewUpdate', handlePreviewUpdate);
    return () => window.removeEventListener('adminPreviewUpdate', handlePreviewUpdate);
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
      <div className="flex-1 overflow-hidden">
        {!iframeLoaded && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        <iframe
          key={refreshKey}
          id="preview-iframe"
          src="/?preview=true"
          className="w-full h-full"
          onLoad={() => setIframeLoaded(true)}
          title="Site Preview"
        />
      </div>
    </div>
  );
}