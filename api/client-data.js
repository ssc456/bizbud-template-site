import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inline Redis client
const redis = (() => {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  
  console.log('[ClientData API] Redis env vars:', {
    url: url ? 'Found' : 'Not found',
    token: token ? 'Found' : 'Not found'
  });

  if (!url || !token) {
    console.error('[ClientData API] Missing Redis credentials');
    return null;
  }

  return new Redis({ url, token });
})();

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    return res.status(200).end();
  }

  // Route based on HTTP method
  if (req.method === 'GET') {
    return handleGetClientData(req, res);
  } else if (req.method === 'POST') {
    return handleSaveClientData(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get client data function (previously in get-client-data.js)
async function handleGetClientData(req, res) {
  // For admin requests, validate authentication
  const requestPath = req.url;
  const isAdminRequest = req.headers.referer?.includes('/admin/dashboard');
  
  if (isAdminRequest) {
    // Extract token from cookie
    const cookies = req.cookies || {};
    const authToken = cookies.adminToken;
    const { siteId } = req.query;
    
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Additional security check - token must be for the requested site
    try {
      const tokenSiteId = await redis.get(`auth:${authToken}`);
      if (!tokenSiteId || tokenSiteId !== siteId) {
        return res.status(403).json({ error: 'Not authorized to access this site' });
      }

      // Verify CSRF token
      const csrfHeader = req.headers['x-csrf-token'];
      const storedCsrfToken = await redis.get(`csrf:${authToken}`);

      if (!csrfHeader || !storedCsrfToken || csrfHeader !== storedCsrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    } catch (authError) {
      console.error('[ClientData API] Auth validation error:', authError);
      return res.status(500).json({ error: 'Auth validation failed' });
    }
  }

  try {
    // Get site ID from query param
    const { siteId } = req.query;
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    // First try Redis if available
    if (redis) {
      try {
        const clientData = await redis.get(`site:${siteId}:client`);
        
        if (clientData) {
          console.log('[ClientData API] Data found in Redis for site:', siteId);
          return res.status(200).json(clientData);
        }
      } catch (redisError) {
        console.error('[ClientData API] Redis error:', redisError);
      }
    }
    
    // Redis failed or no data found, try local fallback
    console.log('[ClientData API] Trying local fallback...');
    try {
      const fallbackPath = path.join(__dirname, '..', 'public', 'client.json');
      const localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      
      console.log('[ClientData API] Using local fallback data');
      return res.status(200).json(localData);
    } catch (fallbackError) {
      console.error('[ClientData API] Fallback error:', fallbackError);
      return res.status(404).json({ error: 'Site not found and fallback unavailable' });
    }
  } catch (error) {
    console.error('[ClientData API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch client data: ' + error.message });
  }
}

// Save client data function (previously in save-client-data.js)
async function handleSaveClientData(req, res) {
  // Extract token from cookie
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;

  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Verify CSRF token
  const csrfHeader = req.headers['x-csrf-token'];
  const storedCsrfToken = await redis.get(`csrf:${authToken}`);

  if (!csrfHeader || !storedCsrfToken || csrfHeader !== storedCsrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Get the site ID associated with this token
  const siteId = await redis.get(`auth:${authToken}`);
  if (!siteId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const { clientData } = req.body;
    
    if (!clientData) {
      return res.status(400).json({ error: 'Client data is required' });
    }
    
    // Add last updated timestamp
    clientData.lastUpdated = new Date().toISOString();
    
    if (!redis) {
      // Local development fallback - save to file
      try {
        const jsonPath = path.join(__dirname, '..', 'public', 'client.json');
        fs.writeFileSync(jsonPath, JSON.stringify(clientData, null, 2));
        console.log('[ClientData API] Saved client data to local file');
        return res.status(200).json({ success: true });
      } catch (fileError) {
        console.error('[ClientData API] Error saving to file:', fileError);
        return res.status(500).json({ error: 'Failed to save client data to file' });
      }
    }
    
    // Save to Redis
    await redis.set(`site:${siteId}:client`, clientData);
    console.log('[ClientData API] Saved client data for site:', siteId);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[ClientData API] Error:', error);
    return res.status(500).json({ error: 'Failed to save client data' });
  }
}