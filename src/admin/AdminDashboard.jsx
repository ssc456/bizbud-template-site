import { useState, useEffect } from 'react';
import { extractSiteId } from '../utils/siteId';

export default function AdminDashboard() {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [siteId, setSiteId] = useState('');
  
  useEffect(() => {
    const extractedSiteId = extractSiteId();
    setSiteId(extractedSiteId);
    
    // Fetch client data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }
        
        console.log('Fetching data for site:', extractedSiteId);
        const response = await fetch(`/api/get-client-data?siteId=${extractedSiteId}`);
        if (!response.ok) {
          throw new Error('Failed to load site data');
        }
        
        const data = await response.json();
        setClientData(data);
      } catch (err) {
        console.error('Dashboard data error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div className="p-8 text-center">Loading site data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard for {clientData?.siteTitle || siteId}</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Site Configuration</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(clientData, null, 2)}
        </pre>
      </div>
    </div>
  );
}