import { Redis } from '@upstash/redis';
import { v2 as cloudinary } from 'cloudinary';

// Setup Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
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
    
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    // Get current media list from Redis
    const mediaItems = await redis.lrange(`site:${siteId}:media`, 0, -1);
    
    // Parse JSON strings and filter out the deleted item
    const updatedMedia = mediaItems
      .map(item => {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item; // Fallback if it's not a JSON string
        }
      })
      .filter(item => item.publicId !== publicId);
    
    // Clear the current list
    await redis.del(`site:${siteId}:media`);
    
    // Add back the filtered items
    if (updatedMedia.length > 0) {
      await redis.lpush(
        `site:${siteId}:media`, 
        ...updatedMedia.map(item => JSON.stringify(item))
      );
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Failed to delete image: ' + error.message });
  }
}