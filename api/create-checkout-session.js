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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { siteId, paymentType, interval = 'monthly' } = req.body;  // Add interval parameter
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    // Get site data
    const siteData = await redis.get(`site:${siteId}:client`);
    if (!siteData) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Already premium?
    if (siteData.paymentTier === 'PREMIUM') {
      return res.status(400).json({ error: 'This site is already premium' });
    }
    
    // Choose price based on interval, not just payment type
    let priceId;
    if (paymentType === 'subscription') {
      // Choose between monthly or annual subscription price
      priceId = interval === 'yearly' 
        ? process.env.STRIPE_YEARLY_PRICE_ID 
        : process.env.STRIPE_MONTHLY_PRICE_ID;
    } else {
      // One-time payment (not currently used)
      priceId = process.env.STRIPE_ONE_TIME_PRICE_ID;
    }
    
    // Always use subscription mode for both monthly and yearly plans
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://${siteId}.vercel.app/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${siteId}.vercel.app/upgrade-cancel`,
      metadata: {
        siteId,
        paymentType,
        interval
      }
    });
    
    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}