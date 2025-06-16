import redis from '../src/utils/redis';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get site ID from query param
    const { siteId } = req.query;
    
    console.log('[Get Data API] Request for site:', siteId);
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    // Test Redis connection
    try {
      await redis.ping();
      console.log('[Get Data API] Redis connection verified');
    } catch (redisError) {
      console.error('[Get Data API] Redis connection error:', redisError);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    // Fetch client data from Redis
    try {
      const clientData = await redis.get(`site:${siteId}:client`);
      
      if (!clientData) {
        console.log('[Get Data API] No data found for site:', siteId);
        return res.status(404).json({ error: 'Site not found' });
      }
      
      console.log('[Get Data API] Data found for site:', siteId);
      return res.status(200).json(clientData);
    } catch (getError) {
      console.error('[Get Data API] Error getting client data:', getError);
      return res.status(500).json({ error: 'Failed to retrieve client data' });
    }
  } catch (error) {
    console.error('[Get Data API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch client data: ' + error.message });
  }
}