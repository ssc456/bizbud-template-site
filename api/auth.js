import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    return res.status(200).end();
  }

  // Extract the action from query parameters
  const { action = 'login' } = req.query;

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'validate':
      return handleValidate(req, res);
    case 'logout':
      return handleLogout(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Original login function
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId, password } = req.body;
  
  if (!siteId || !password) {
    return res.status(400).json({ error: 'Site ID and password are required' });
  }

  try {
    // Get site settings with password hash
    const siteSettings = await redis.get(`site:${siteId}:settings`);
    
    if (!siteSettings?.adminPasswordHash) {
      return res.status(404).json({ error: 'Site not found or not configured' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, siteSettings.adminPasswordHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate session token and CSRF token
    const sessionToken = uuidv4();
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Store session with expiry (24 hours)
    await redis.set(`auth:${sessionToken}`, siteId);
    await redis.expire(`auth:${sessionToken}`, 24 * 60 * 60);
    
    // Store CSRF token with the same expiry
    await redis.set(`csrf:${sessionToken}`, csrfToken);
    await redis.expire(`csrf:${sessionToken}`, 24 * 60 * 60);
    
    // Set HttpOnly cookie
    res.setHeader('Set-Cookie', [
      `adminToken=${sessionToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`,
      `siteId=${siteId}; Path=/; Max-Age=${24 * 60 * 60}`
    ]);
    
    return res.status(200).json({ 
      success: true,
      csrfToken,
      message: 'Authentication successful' 
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Token validation function (previously in validate-token.js)
async function handleValidate(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

// Logout function (previously in logout.js)
async function handleLogout(req, res) {
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