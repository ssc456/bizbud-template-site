import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sendEmail } from './utils/email.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    return res.status(200).end();
  }

  // Extract the action from query parameters
  const { action = 'login' } = req.query;

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'validate':
      return handleValidate(req, res);
    case 'logout':
      return handleLogout(req, res);
    case 'get-admin-email':
      return handleGetAdminEmail(req, res);
    case 'reset-password':
      return handlePasswordReset(req, res);
    case 'verify-reset':
      return handleVerifyReset(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Original login function
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId, password } = req.body;
  
  if (!siteId || !password) {
    return res.status(400).json({ error: 'Site ID and password are required' });
  }

  try {
    // Get site settings with password hash
    const siteSettings = await redis.get(`site:${siteId}:settings`);
    
    if (!siteSettings?.adminPasswordHash) {
      return res.status(404).json({ error: 'Site not found or not configured' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, siteSettings.adminPasswordHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate session token and CSRF token
    const sessionToken = uuidv4();
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Store session with expiry (24 hours)
    await redis.set(`auth:${sessionToken}`, siteId);
    await redis.expire(`auth:${sessionToken}`, 24 * 60 * 60);
    
    // Store CSRF token with the same expiry
    await redis.set(`csrf:${sessionToken}`, csrfToken);
    await redis.expire(`csrf:${sessionToken}`, 24 * 60 * 60);
    
    // Set HttpOnly cookie
    res.setHeader('Set-Cookie', [
      `adminToken=${sessionToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`,
      `siteId=${siteId}; Path=/; Max-Age=${24 * 60 * 60}`
    ]);
    
    return res.status(200).json({ 
      success: true,
      csrfToken,
      message: 'Authentication successful' 
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Token validation function (previously in validate-token.js)
async function handleValidate(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId } = req.query;
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;
  
  if (!siteId) {
    return res.status(400).json({ valid: false, error: 'Missing siteId parameter' });
  }
  
  if (!authToken) {
    return res.status(401).json({ valid: false, error: 'No authentication token provided' });
  }
  
  try {
    // Validate token belongs to this site
    const tokenSiteId = await redis.get(`auth:${authToken}`);
    
    if (!tokenSiteId) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
    
    if (tokenSiteId !== siteId) {
      return res.status(403).json({ 
        valid: false, 
        error: 'Token is not valid for this site',
        actualSite: tokenSiteId
      });
    }
    
    return res.status(200).json({ valid: true, siteId });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}

// Logout function (previously in logout.js)
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract token from cookie
  const cookies = req.cookies || {};
  const authToken = cookies.adminToken;
  
  if (authToken) {
    try {
      // Invalidate token in Redis
      await redis.del(`auth:${authToken}`);
      await redis.del(`csrf:${authToken}`);
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if Redis fails
    }
  }
  
  // Clear cookies
  res.setHeader('Set-Cookie', [
    'adminToken=; HttpOnly; Path=/; Max-Age=0',
    'siteId=; Path=/; Max-Age=0'
  ]);
  
  return res.status(200).json({ success: true });
}

// Get admin email for password reset confirmation
async function handleGetAdminEmail(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId } = req.query;
  
  if (!siteId) {
    return res.status(400).json({ error: 'Site ID is required' });
  }

  try {
    // Get site settings and client data
    const siteSettings = await redis.get(`site:${siteId}:settings`);
    const clientData = await redis.get(`site:${siteId}:client`);
    
    if (!siteSettings?.adminPasswordHash) {
      return res.status(404).json({ error: 'Site not found or not configured' });
    }

    // Find admin email from multiple possible locations
    const adminEmail = siteSettings?.adminEmail || 
                      clientData?.adminEmail || 
                      clientData?.email ||
                      clientData?.contact?.email;

    if (!adminEmail) {
      return res.status(404).json({ error: 'Admin email not found for this site' });
    }

    // Return masked email for security (show first 2 chars, domain, mask the middle)
    const emailParts = adminEmail.split('@');
    const localPart = emailParts[0];
    const domain = emailParts[1];
    
    let maskedEmail;
    if (localPart.length <= 2) {
      maskedEmail = `${localPart}***@${domain}`;
    } else {
      const visibleChars = Math.min(2, localPart.length - 1);
      const maskedPart = '*'.repeat(Math.max(3, localPart.length - visibleChars));
      maskedEmail = `${localPart.substring(0, visibleChars)}${maskedPart}@${domain}`;
    }

    return res.status(200).json({ 
      success: true, 
      maskedEmail,
      siteExists: true
    });
  } catch (error) {
    console.error('Get admin email error:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin email' });
  }
}

// Password reset request function
async function handlePasswordReset(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId, email } = req.body;
  
  if (!siteId || !email) {
    return res.status(400).json({ error: 'Site ID and email address are required' });
  }

  try {
    // Get site settings to find the admin email
    const siteSettings = await redis.get(`site:${siteId}:settings`);
    const clientData = await redis.get(`site:${siteId}:client`);
    
    if (!siteSettings?.adminPasswordHash) {
      return res.status(404).json({ error: 'Site not found or not configured' });
    }

    // Find admin email from multiple possible locations
    const adminEmail = siteSettings?.adminEmail || 
                      clientData?.adminEmail || 
                      clientData?.email ||
                      clientData?.contact?.email;

    if (!adminEmail) {
      return res.status(404).json({ error: 'Admin email not found for this site' });
    }

    // Verify the provided email matches the admin email
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(400).json({ error: 'The email address provided does not match the admin email for this site' });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    // Store reset token in Redis with 15-minute expiry
    await redis.set(`reset:${siteId}:${resetToken}`, JSON.stringify({
      email: adminEmail,
      createdAt: new Date().toISOString(),
      expiresAt: resetExpiry.toISOString()
    }));
    await redis.expire(`reset:${siteId}:${resetToken}`, 15 * 60); // 15 minutes

    // Get business name for the email
    const businessName = clientData?.siteTitle || clientData?.businessName || siteId;
    
    // Send password reset email
    const resetUrl = `https://${siteId}.entrynets.com/admin/reset-password?token=${resetToken}&siteId=${siteId}`;
    
    const emailResult = await sendEmail({
      to: adminEmail,
      subject: `Password Reset Request for ${businessName}`,
      text: `You requested a password reset for your ${businessName} admin account. Click the link to reset your password: ${resetUrl}\n\nThis link will expire in 15 minutes. If you didn't request this reset, you can safely ignore this email.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your <strong>${businessName}</strong> admin account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p style="color: #ef4444; font-weight: 500;">⚠️ This link will expire in 15 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
      `
    });

    if (!emailResult.success) {
      console.error(`[Auth API] Failed to send reset email: ${emailResult.error}`);
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Password reset link sent to your email address' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Failed to process password reset' });
  }
}

// Verify reset token and update password function
async function handleVerifyReset(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteId, token, newPassword } = req.body;
  
  if (!siteId || !token || !newPassword) {
    return res.status(400).json({ error: 'Site ID, token, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Get reset token data
    const resetData = await redis.get(`reset:${siteId}:${token}`);
    
    if (!resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Parse the reset data (it's stored as JSON string)
    let resetInfo;
    try {
      resetInfo = typeof resetData === 'string' ? JSON.parse(resetData) : resetData;
    } catch (error) {
      console.error('Password reset token parsing error:', error);
      return res.status(400).json({ error: 'Invalid reset token format' });
    }
    
    // Check if token has expired
    if (new Date(resetInfo.expiresAt) < new Date()) {
      // Clean up expired token
      await redis.del(`reset:${siteId}:${token}`);
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the site settings with new password
    const siteSettings = await redis.get(`site:${siteId}:settings`);
    if (!siteSettings) {
      return res.status(404).json({ error: 'Site settings not found' });
    }

    siteSettings.adminPasswordHash = hashedPassword;
    siteSettings.passwordUpdatedAt = new Date().toISOString();
    
    await redis.set(`site:${siteId}:settings`, siteSettings);

    // Clean up the reset token
    await redis.del(`reset:${siteId}:${token}`);

    // Send confirmation email
    const clientData = await redis.get(`site:${siteId}:client`);
    const businessName = clientData?.siteTitle || clientData?.businessName || siteId;
    
    try {
      await sendEmail({
        to: resetInfo.email,
        subject: `Password Updated for ${businessName}`,
        text: `Your password for ${businessName} admin account has been successfully updated. If you didn't make this change, please contact support immediately.`,
        html: `
          <h2>Password Updated Successfully</h2>
          <p>Your password for <strong>${businessName}</strong> admin account has been successfully updated.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p style="color: #6b7280; font-size: 14px;">This is an automated message from EntryNets.</p>
        `
      });
    } catch (emailError) {
      // Don't fail the reset if confirmation email fails
      console.warn('[Auth API] Failed to send password update confirmation:', emailError);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Password reset verification error:', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}