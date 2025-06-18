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
    
    // Enhanced file path detection for array-like file objects
    let filePath;
    if (file[0] && typeof file[0] === 'object') {
      // Handle array-like structure from newer formidable versions
      console.log('Detected array-like file structure');
      filePath = file[0].filepath || file[0].path;
      console.log('Using path from array element:', filePath);
    } else {
      // Try traditional paths
      filePath = file.filepath || file.path || (file.toJSON && file.toJSON().filepath);
      console.log('Using traditional file path:', filePath);
    }
    
    // Additional validation
    if (!filePath) {
      console.error('Could not determine file path from structure:', JSON.stringify(file, null, 2).substring(0, 500));
      return res.status(400).json({ error: 'Could not process uploaded file - path not found' });
    }
    
    // Verify the file exists before attempting to upload
    if (!fs.existsSync(filePath)) {
      console.error(`File path does not exist: ${filePath}`);
      return res.status(400).json({ error: 'File not found at the specified path' });
    }
    
    // Try to determine the file type before uploading
    let fileType;
    try {
      const fileBuffer = fs.readFileSync(filePath, { encoding: null });
      const fileSignature = fileBuffer.slice(0, 4).toString('hex');
      console.log('File signature:', fileSignature);
      
      // Check common image signatures
      if (fileSignature.startsWith('89504e47')) fileType = 'image/png';
      else if (fileSignature.startsWith('ffd8ff')) fileType = 'image/jpeg';
      else if (fileSignature.startsWith('47494638')) fileType = 'image/gif';
      
      console.log('Detected file type:', fileType || 'unknown');
    } catch (err) {
      console.warn('Could not read file for type detection:', err.message);
    }
    
    // Upload to Cloudinary with more error handling
    try {
      // Add more parameters to help Cloudinary process the file
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `bizbud/${siteId}`,
        resource_type: 'auto',
        format: fileType ? fileType.split('/')[1] : undefined
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