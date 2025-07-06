import { Redis } from '@upstash/redis';

// Initialize Redis client
let redis;
try {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
} catch (e) {
  console.error('Failed to initialize Redis client:', e);
}

export default async function handler(req, res) {
  try {
    // Check if Redis is available
    if (!redis) {
      return res.status(500).json({ error: 'Database connection unavailable' });
    }
    
    // Handle different HTTP methods
    if (req.method === 'GET') {
      const { action, siteId } = req.query;
      
      if (!siteId) {
        return res.status(400).json({ error: 'Site ID is required' });
      }
      
      if (action === 'getCompanyInfo') {
        return await getCompanyInfo(req, res, siteId);
      }
      
      if (action === 'getInvoices') {
        return await getInvoices(req, res, siteId);
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    if (req.method === 'POST') {
      const { action, siteId } = req.body;
      
      if (!siteId) {
        return res.status(400).json({ error: 'Site ID is required' });
      }
      
      if (action === 'saveCompanyInfo') {
        return await saveCompanyInfo(req, res, siteId);
      }
      
      if (action === 'saveInvoice') {
        return await saveInvoice(req, res, siteId);
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Invoicing API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handler functions for each action
async function getCompanyInfo(req, res, siteId) {
  try {
    // Get company info from Redis
    const companyInfo = await redis.get(`site:${siteId}:invoicing:company`);
    
    if (!companyInfo) {
      // Return empty company info if not found
      const clientData = await redis.get(`site:${siteId}:client`);
      
      // Create default company info from client data if available
      const defaultCompanyInfo = {
        name: clientData?.siteTitle || '',
        email: clientData?.contact?.email || '',
        phone: clientData?.contact?.phone || '',
        address: clientData?.contact?.address || '',
      };
      
      return res.status(200).json({ companyInfo: defaultCompanyInfo });
    }
    
    return res.status(200).json({ companyInfo });
  } catch (error) {
    console.error('[Invoicing API] Error getting company info:', error);
    return res.status(500).json({ error: 'Failed to get company info' });
  }
}

async function saveCompanyInfo(req, res, siteId) {
  try {
    const { companyInfo } = req.body;
    
    if (!companyInfo) {
      return res.status(400).json({ error: 'Company info is required' });
    }
    
    // Save company info to Redis
    await redis.set(`site:${siteId}:invoicing:company`, companyInfo);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Invoicing API] Error saving company info:', error);
    return res.status(500).json({ error: 'Failed to save company info' });
  }
}

async function getInvoices(req, res, siteId) {
  try {
    // Get invoices from Redis
    const invoices = await redis.get(`site:${siteId}:invoicing:invoices`);
    
    if (!invoices) {
      // Return empty array if no invoices found
      return res.status(200).json({ invoices: [] });
    }
    
    return res.status(200).json({ invoices });
  } catch (error) {
    console.error('[Invoicing API] Error getting invoices:', error);
    return res.status(500).json({ error: 'Failed to get invoices' });
  }
}

async function saveInvoice(req, res, siteId) {
  try {
    const { invoice } = req.body;
    
    if (!invoice) {
      return res.status(400).json({ error: 'Invoice is required' });
    }
    
    // Ensure invoice has a status
    if (!invoice.status) {
      invoice.status = 'unpaid';
    }
    
    // Get existing invoices
    let invoices = await redis.get(`site:${siteId}:invoicing:invoices`) || [];
    
    // Check if invoice already exists (for updates)
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      // Update existing invoice
      invoices[existingIndex] = invoice;
    } else {
      // Add new invoice
      invoices.push(invoice);
    }
    
    // Save invoices to Redis
    await redis.set(`site:${siteId}:invoicing:invoices`, invoices);
    
    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error('[Invoicing API] Error saving invoice:', error);
    return res.status(500).json({ error: 'Failed to save invoice' });
  }
}