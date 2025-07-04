import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract token from cookie
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;
  
  if (authToken) {
    try {
      // Invalidate token in Redis
      await redis.del(`auth:${authToken}`);
      await redis.del(`csrf:${authToken}`);
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if Redis fails
    }
  }
  
  // Clear cookies
  res.setHeader('Set-Cookie', [
    'adminToken=; HttpOnly; Path=/; Max-Age=0',
    'siteId=; Path=/; Max-Age=0'
  ]);
  
  return res.status(200).json({ success: true });
}