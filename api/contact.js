import redis from './utils/redis.js';
import { sendEmail } from './utils/email.js';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const siteId = req.query.siteId;
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    // Get form data
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Fetch site data to get owner's email
    const siteSettings = await redis.get(`site:${siteId}:settings`);
    const clientData = await redis.get(`site:${siteId}:client`);
    
    // Find owner email from multiple possible locations
    const ownerEmail = siteSettings?.adminEmail || 
                       clientData?.adminEmail || 
                       clientData?.email ||
                       clientData?.contact?.email;
    
    if (!ownerEmail) {
      return res.status(500).json({ error: 'Site owner email not found' });
    }
    
    // Get business name
    const businessName = clientData?.siteTitle || clientData?.businessName || siteId;
    
    // Send email to owner
    const emailResult = await sendEmail({
      to: ownerEmail,
      subject: `New Contact Form: ${subject || 'Message from Website'}`,
      text: `You received a new message from your website contact form.\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Message from Website</h2>
        <p>You received a new message from your website contact form.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Name</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Subject</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${subject || 'No subject'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Message</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <p>You can reply directly to this email to respond to the message.</p>
      `
    });
    
    if (!emailResult.success) {
      console.warn(`[Contact API] Email wasn't sent: ${emailResult.error}`);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    
    // Optional: Send confirmation email to sender
    try {
      await sendEmail({
        to: email,
        subject: `Thank you for contacting ${businessName}`,
        text: `Thank you for your message to ${businessName}. We'll get back to you shortly.`,
        html: `
          <h2>Thank you for contacting us</h2>
          <p>Your message has been received by ${businessName}. We'll respond to you shortly.</p>
          <p>For your records, here's a copy of your message:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #4F46E5;">
            <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        `
      });
    } catch (confirmError) {
      // Don't fail if confirmation email fails
      console.warn('[Contact API] Failed to send confirmation email:', confirmError);
    }
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('[Contact API] Error processing contact form:', error);
    return res.status(500).json({ error: 'Failed to process contact form' });
  }
}