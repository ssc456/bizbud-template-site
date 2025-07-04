import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-CSRF-Token');
    return res.status(200).end();
  }
  
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get site ID and auth token from cookies
  const { siteId } = req.query;
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;
  
  if (!siteId) {
    return res.status(400).json({ valid: false, error: 'Missing siteId parameter' });
  }
  
  if (!authToken) {
    return res.status(401).json({ valid: false, error: 'No authentication token provided' });
  }
  
  try {
    // Validate token belongs to this site
    const tokenSiteId = await redis.get(`auth:${authToken}`);
    
    if (!tokenSiteId) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
    
    if (tokenSiteId !== siteId) {
      return res.status(403).json({ 
        valid: false, 
        error: 'Token is not valid for this site',
        actualSite: tokenSiteId
      });
    }
    
    return res.status(200).json({ valid: true, siteId });
    
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}