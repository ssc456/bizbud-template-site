import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    
    const diagnostics = {
      environmentVariables: {
        KV_REST_API_URL: url ? 'Found' : 'Not Found',
        KV_REST_API_TOKEN: token ? 'Found' : 'Not Found'
      },
      timestamp: new Date().toISOString()
    };
    
    if (!url || !token) {
      diagnostics.redisConnection = 'Failed: Missing credentials';
      return res.status(200).json(diagnostics);
    }
    
    try {
      const redis = new Redis({ url, token });
      await redis.ping();
      diagnostics.redisConnection = 'Success';
    } catch (error) {
      diagnostics.redisConnection = `Failed: ${error.message}`;
    }
    
    return res.status(200).json(diagnostics);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}