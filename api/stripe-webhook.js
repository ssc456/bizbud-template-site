import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { buffer } from 'micro';

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing for Stripe webhook
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const siteId = session.metadata.siteId;
        const paymentType = session.metadata.paymentType;
        
        // Update the site's payment tier
        const siteData = await redis.get(`site:${siteId}:client`);
        if (siteData) {
          siteData.paymentTier = 'PREMIUM';
          
          // Store customer ID for future reference
          if (session.customer) {
            siteData.stripeCustomerId = session.customer;
          }
          
          // Store subscription ID for recurring payments
          if (paymentType === 'subscription' && session.subscription) {
            siteData.subscriptionId = session.subscription;
          }
          
          await redis.set(`site:${siteId}:client`, siteData);
          console.log(`Site ${siteId} upgraded to PREMIUM`);
        }
        break;
      }
      
      // Handle subscription cancellations or payment failures if needed
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Find sites with this subscription ID and downgrade them
        // This would require a more complex lookup - consider adding a reverse index
        break;
      }
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}