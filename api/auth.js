import redis from '../src/utils/redis';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password, siteId } = req.body;
    
    console.log('Auth request for site:', siteId);
    
    if (!password || !siteId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Test Redis connection first
    try {
      await redis.ping();
      console.log('Redis connection successful');
    } catch (redisError) {
      console.error('Redis connection error:', redisError);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Get site settings from Redis
    let siteSettings;
    try {
      siteSettings = await redis.get(`site:${siteId}:settings`);
      console.log('Site settings retrieved:', siteSettings ? 'Found' : 'Not found');
    } catch (getError) {
      console.error('Error retrieving site settings:', getError);
      return res.status(500).json({ error: 'Failed to retrieve site settings' });
    }
    
    // If site doesn't exist or no password is set, use default password
    const storedHash = siteSettings?.adminPasswordHash || '$2a$12$TDVpKTt9jaQVSoitO7KnI.ZLMT1efjmOlg/hgQ2uHW/KylSw.in7e';
    
    // Compare password with stored hash
    const isValid = await bcrypt.compare(password, storedHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate a session token
    const sessionToken = uuidv4();
    
    // Store token in Redis with 24-hour expiry
    await redis.set(`auth:${sessionToken}`, siteId, { ex: 86400 });
    
    return res.status(200).json({ 
      success: true, 
      token: sessionToken,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
}