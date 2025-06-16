import redis from '../src/utils/redis';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const diagnostics = {
      environmentVariables: {
        KV_REST_API_URL: process.env.KV_REST_API_URL ? 'Found' : 'Not Found',
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'Found' : 'Not Found'
      },
      timestamp: new Date().toISOString()
    };
    
    try {
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