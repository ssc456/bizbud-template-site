import redis from './utils/redis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get site ID from query param
    const { siteId } = req.query;
    console.log('[Get Data API] Request for site:', siteId);
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    try {
      // First try Redis
      const clientData = await redis.get(`site:${siteId}:client`);
      
      if (clientData) {
        console.log('[Get Data API] Data found in Redis for site:', siteId);
        return res.status(200).json(clientData);
      }
    } catch (redisError) {
      console.error('[Get Data API] Redis error:', redisError);
      // Continue to fallback
    }
    
    // Redis failed or no data found, try local fallback
    console.log('[Get Data API] Trying local fallback...');
    try {
      const fallbackPath = path.join(__dirname, '..', 'public', 'client.json');
      const localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      
      console.log('[Get Data API] Using local fallback data');
      return res.status(200).json(localData);
    } catch (fallbackError) {
      console.error('[Get Data API] Fallback error:', fallbackError);
      return res.status(404).json({ error: 'Site not found and fallback unavailable' });
    }
  } catch (error) {
    console.error('[Get Data API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch client data: ' + error.message });
  }
}