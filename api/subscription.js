import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Get the site ID from query parameters
  const { siteId } = req.query;
  
  if (!siteId) {
    return res.status(400).json({ error: 'Site ID is required' });
  }
  
  // Handle GET request - get subscription details
  if (req.method === 'GET') {
    try {
      // Get site data from Redis
      const siteData = await redis.get(`site:${siteId}:client`);
      
      if (!siteData) {
        return res.status(404).json({ error: 'Site not found' });
      }
      
      // Check if site has a subscription
      if (!siteData.subscriptionId) {
        return res.json(null); // No subscription
      }
      
      // Get subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(siteData.subscriptionId);
      
      // Format the subscription data for the frontend
      const formattedSubscription = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        plan: subscription.items.data[0]?.plan.nickname || 'Premium',
      };
      
      return res.status(200).json(formattedSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription details' });
    }
  }
  
  // Handle DELETE request - cancel subscription
  if (req.method === 'DELETE') {
    try {
      // Get site data from Redis
      const siteData = await redis.get(`site:${siteId}:client`);
      
      if (!siteData) {
        return res.status(404).json({ error: 'Site not found' });
      }
      
      // Check if site has a subscription
      if (!siteData.subscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      // Cancel the subscription immediately
      await stripe.subscriptions.cancel(siteData.subscriptionId);
      
      // Update site data in Redis (optional, as the webhook should handle this)
      siteData.paymentTier = 'FREE';
      siteData.subscriptionId = null;
      await redis.set(`site:${siteId}:client`, siteData);
      
      return res.status(200).json({ 
        success: true,
        message: 'Subscription has been canceled'
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}