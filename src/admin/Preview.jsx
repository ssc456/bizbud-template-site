import { useState, useEffect, useRef } from 'react';

export default function Preview({ clientData }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to send data to iframe
  const sendDataToIframe = () => {
    if (!iframeRef.current || !clientData) return;
    
    try {
      console.log('[Preview] Sending data to iframe');
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_CLIENT_DATA',
        clientData: JSON.parse(JSON.stringify(clientData))
      }, '*');
    } catch (err) {
      console.error('[Preview] Error sending data:', err);
    }
  };

  // Send data whenever clientData changes
  useEffect(() => {
    if (iframeLoaded) {
      sendDataToIframe();
    }
  }, [clientData, iframeLoaded]);

  // Set up message listener
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'PREVIEW_LOADED') {
        console.log('[Preview] Iframe signaled it is loaded');
        setIframeLoaded(true);
        
        // Send data after a small delay to ensure iframe is truly ready
        setTimeout(() => sendDataToIframe(), 100);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clientData]);

  // Handle refresh button click
  const handleRefresh = () => {
    setIframeLoaded(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 border-b border-gray-200 flex justify-between items-center p-3">
        <h3 className="font-medium">Live Preview</h3>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      
      <div className="flex-1 relative">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          key={refreshKey}
          id="preview-iframe"
          src="/?preview=true"
          className="w-full h-full"
          onLoad={() => console.log('[Preview] Iframe onLoad event fired')}
        />
      </div>
    </div>
  );
}