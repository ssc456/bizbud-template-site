import { Redis } from '@upstash/redis';

// Add error handling for missing environment variables
const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error('Redis environment variables missing:', { 
    url: !!url, 
    token: !!token 
  });
}

// Initialize Redis client from environment variables
const redis = new Redis({
  url,
  token,
});

export default redis;