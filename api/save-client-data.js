import { Redis } from '@upstash/redis';

// Inline Redis client
const redis = (() => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  console.log('[SaveData API] Redis env vars:', {
    url: url ? 'Found' : 'Not found',
    token: token ? 'Found' : 'Not found'
  });

  if (!url || !token) {
    console.error('[SaveData API] Missing Redis credentials');
    return null;
  }

  return new Redis({ url, token });
})();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  const authToken = req.headers.authorization?.split(' ')[1];
  
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!redis) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  
  try {
    // Check if token is valid
    const siteId = await redis.get(`auth:${authToken}`);
    
    if (!siteId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { clientData } = req.body;
    
    if (!clientData) {
      return res.status(400).json({ error: 'Client data is required' });
    }
    
    // Store client data in Redis
    await redis.set(`site:${siteId}:client`, clientData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Data saved successfully' 
    });
  } catch (error) {
    console.error('Error saving client data:', error);
    return res.status(500).json({ error: 'Failed to save client data' });
  }
}