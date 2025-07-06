/**
 * Email utility for appointment notifications
 * Uses Resend API credentials that are set during site creation
 */

// Initialize Resend API client if credentials are available
let resendClient = null;
try {
  if (process.env.RESEND_API_KEY) {
    // Use dynamic import to avoid build-time dependency
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.warn('[Email] Failed to initialize Resend client:', error.message);
}

/**
 * Send an email using Resend API
 * Falls back to logging if Resend is not configured
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    // Check if we're in development and log the email content
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 [Email Preview]');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text}`);
    }
    
    // If Resend client is not available, just log and return
    if (!resendClient) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('[Email] Warning: Email not sent - Resend API key not configured');
      }
      return { success: false, error: 'Email service not configured' };
    }
    
    // Get from address from environment or use a fallback
    const siteId = process.env.VITE_SITE_ID || '';
    const fromEmail = process.env.EMAIL_FROM || `${siteId}@entrynets.com`;
    
    // Send the email using Resend
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to,
      subject,
      text,
      html
    });
    
    if (error) {
      console.error('[Email] Error sending email:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Unexpected error sending email:', error);
    return { success: false, error: error.message };
  }
}