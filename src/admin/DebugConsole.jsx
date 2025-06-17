import { useState } from 'react';

export default function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);

  const testPreviewCommunication = () => {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe || !iframe.contentWindow) {
      alert('Preview iframe not found!');
      return;
    }

    try {
      iframe.contentWindow.postMessage({
        type: 'TEST_MESSAGE',
        data: 'Hello from admin'
      }, '*');
      console.log('[Debug] Test message sent to preview iframe');
    } catch (err) {
      console.error('[Debug] Error sending test message:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        title="Debug Tools"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded shadow-lg border p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Debug Console</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-600">×</button>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={testPreviewCommunication}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Preview Communication
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}