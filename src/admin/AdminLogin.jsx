import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [siteId, setSiteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Extract site ID from hostname or URL params
  useState(() => {
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const siteParam = urlParams.get('site');
    
    let extractedSiteId;
    if (hostname.includes('.') && !hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1')) {
      // Get from subdomain
      extractedSiteId = hostname.split('.')[0];
    } else {
      // For localhost
      extractedSiteId = siteParam || 'default';
    }
    
    setSiteId(extractedSiteId);
  }, []);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, siteId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save token
      localStorage.setItem('adminToken', data.token);
      
      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Site ID</label>
            <input
              type="text"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={!!siteId}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}