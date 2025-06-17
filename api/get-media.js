import { Redis } from '@upstash/redis';

// Setup Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication
  const authToken = req.headers.authorization?.split(' ')[1];
  
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Check if token is valid
    const siteId = await redis.get(`auth:${authToken}`);
    
    if (!siteId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get media items from Redis
    const mediaItems = await redis.lrange(`site:${siteId}:media`, 0, -1);
    
    // Parse JSON strings to objects
    const media = mediaItems.map(item => {
      try {
        return JSON.parse(item);
      } catch (e) {
        return item; // Fallback if it's not a JSON string
      }
    });
    
    return res.status(200).json({ media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
}