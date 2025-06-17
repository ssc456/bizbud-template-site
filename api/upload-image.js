import { Redis } from '@upstash/redis';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

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

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    
    // Parse form data with more debug information
    const form = new IncomingForm({ 
      keepExtensions: true,
      multiples: true
    });
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        
        // Log structure to help debug
        console.log('Fields received:', Object.keys(fields));
        console.log('Files received:', Object.keys(files));
        
        resolve({ fields, files });
      });
    });
    
    // Handle file property differences in serverless environments
    const fileKey = Object.keys(files)[0];
    const file = files[fileKey];
    
    console.log('File object properties:', Object.keys(file));
    
    // Try different property paths that might contain the file path
    const filePath = file.filepath || file.path || (file.toJSON && file.toJSON().filepath) || 
                    (file[0] && (file[0].filepath || file[0].path));
    
    if (!file || !filePath) {
      console.error('File upload issue - file object:', JSON.stringify(file).substring(0, 200));
      return res.status(400).json({ error: 'No file uploaded or invalid file structure' });
    }

    // Upload to Cloudinary with more error handling
    try {
      // Use the file path we determined above
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `bizbud/${siteId}`,
        resource_type: 'auto'
      });
      
      // Clean up the temporary file if it exists
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }
      
      // Store reference in Redis for media library
      const mediaItem = {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        createdAt: new Date().toISOString()
      };
      
      // Add to media library list
      await redis.lpush(`site:${siteId}:media`, JSON.stringify(mediaItem));
      
      return res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({ error: 'Failed to upload to image service: ' + cloudinaryError.message });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to process upload: ' + error.message });
  }
}