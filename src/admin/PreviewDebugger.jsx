import { useState, useEffect } from 'react';

export default function PreviewDebugger() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Intercept console logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('[Preview]') || args[0].includes('[App Preview]'))) {
        setLogs(prev => [...prev, { type: 'log', message: args.join(' '), time: new Date().toISOString() }]);
      }
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('[Preview]') || args[0].includes('[App Preview]'))) {
        setLogs(prev => [...prev, { type: 'error', message: args.join(' '), time: new Date().toISOString() }]);
      }
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg"
        title="Preview Debugger"
      >
        🔍
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 h-80 bg-white rounded shadow-lg border overflow-hidden flex flex-col">
      <div className="bg-gray-100 p-2 flex justify-between items-center">
        <h3 className="font-medium">Preview Debugger</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-600">×</button>
      </div>
      <div className="flex-1 overflow-auto p-2 text-xs font-mono bg-gray-50">
        {logs.length === 0 ? (
          <p className="text-gray-400">No preview logs yet...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-600' : ''}`}>
              <span className="opacity-50">{log.time.split('T')[1].split('.')[0]}</span> {log.message}
            </div>
          ))
        )}
      </div>
      <div className="border-t p-2 flex">
        <button 
          onClick={() => setLogs([])}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm mr-2"
        >
          Clear
        </button>
      </div>
    </div>
  );
}