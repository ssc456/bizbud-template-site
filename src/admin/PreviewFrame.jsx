import { useState, useEffect, useRef } from 'react';

export default function PreviewFrame({ clientData }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const [key, setKey] = useState(0);
  
  // Function to send data to the iframe
  const sendDataToIframe = () => {
    if (!iframeRef.current || !clientData) return;
    
    try {
      console.log('[PreviewFrame] Attempting to send data to iframe');
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_CLIENT_DATA',
        clientData: JSON.parse(JSON.stringify(clientData))
      }, '*');
    } catch (err) {
      console.error('[PreviewFrame] Error sending data:', err);
    }
  };
  
  // Listen for ready message from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'PREVIEW_LOADED') {
        console.log('[PreviewFrame] Iframe signaled ready');
        setLoading(false);
        
        // Send data after a short delay
        setTimeout(sendDataToIframe, 200);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Send updated data when clientData changes
  useEffect(() => {
    if (!loading && clientData) {
      console.log('[PreviewFrame] Client data updated, sending to iframe');
      sendDataToIframe();
    }
  }, [clientData, loading]);
  
  // Manual refresh handler
  const handleRefresh = () => {
    setLoading(true);
    setKey(prev => prev + 1);
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Live Preview</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-sm text-gray-600">Loading...</span>
          )}
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          key={key}
          src="/?preview=true"
          className="w-full h-full border-none"
          title="Site Preview"
        />
      </div>
    </div>
  );
}