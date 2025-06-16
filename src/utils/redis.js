import { Redis } from '@upstash/redis';

// Log environment variable status for debugging
const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

console.log('[Redis] Environment variables check:', {
  url: url ? 'Found' : 'Not found',
  token: token ? 'Found' : 'Not found'
});

if (!url || !token) {
  console.error('[Redis] Missing environment variables!');
}

let redis;

try {
  // Initialize Redis client from environment variables
  redis = new Redis({
    url,
    token,
  });
  
  // Test connection in background (don't await)
  setTimeout(async () => {
    try {
      await redis.ping();
      console.log('[Redis] Connection test successful');
    } catch (error) {
      console.error('[Redis] Connection test failed:', error);
    }
  }, 0);
  
} catch (error) {
  console.error('[Redis] Initialization error:', error);
  
  // Create a fallback mock Redis client that logs operations
  redis = {
    get: async (key) => {
      console.error(`[Redis Mock] GET operation for key "${key}" - Redis unavailable`);
      return null;
    },
    set: async (key, value) => {
      console.error(`[Redis Mock] SET operation for key "${key}" - Redis unavailable`);
      return null;
    },
    // Add other necessary methods as needed
    ping: async () => {
      console.error(`[Redis Mock] PING operation - Redis unavailable`);
      throw new Error('Redis connection unavailable');
    }
  };
}

export default redis;