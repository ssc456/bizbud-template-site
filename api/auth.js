import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
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
    
    // SECURITY IMPROVEMENT: Remove default fallback
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
    await redis.expire(`auth:${sessionToken}`, 24 * 60 * 60); // 24 hours
    
    // Store CSRF token with the same expiry
    await redis.set(`csrf:${sessionToken}`, csrfToken);
    await redis.expire(`csrf:${sessionToken}`, 24 * 60 * 60); // 24 hours
    
    // SECURITY IMPROVEMENT: Set HttpOnly cookie instead of returning token for localStorage
    res.setHeader('Set-Cookie', [
      `adminToken=${sessionToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`,
      `siteId=${siteId}; Path=/; Max-Age=${24 * 60 * 60}`
    ]);
    
    // Return success with CSRF token
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