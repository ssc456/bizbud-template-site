import redis from '../src/utils/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get site ID from query param
    const { siteId } = req.query;
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    // Fetch client data from Redis store
    const clientData = await redis.get(`site:${siteId}:client`);
    
    if (!clientData) {
      // If no data in Redis, return 404
      return res.status(404).json({ error: 'Site not found' });
    }
    
    return res.status(200).json(clientData);
  } catch (error) {
    console.error('Error fetching client data:', error);
    return res.status(500).json({ error: 'Failed to fetch client data' });
  }
}