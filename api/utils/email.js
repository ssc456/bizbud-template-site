import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {string} options.text Plain text content
 * @param {string} options.html HTML content
 * @returns {Promise} The result of the email send operation
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return;
  }
  
  try {
    const fromEmail = process.env.EMAIL_FROM || 'notifications@yourdomain.com';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      text,
      html
    });
    
    console.log(`Email sent to ${to}:`, result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}