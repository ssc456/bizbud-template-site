# Password Reset Functionality

This document explains the password reset functionality that has been implemented for the admin portal.

## Overview

The password reset functionality allows site administrators to reset their passwords when they forget them. The implementation uses a secure token-based approach with time-limited expiry (15 minutes).

## How It Works

### 1. Request Password Reset
- Admin goes to the login page at `/admin/login`
- Clicks "Forgot your password?" link
- Enters their Site ID and clicks "Continue"
- System looks up the admin email address from Redis (`site:{siteId}:settings.adminEmail`)
- System displays a masked version of the admin email for confirmation
- Admin enters the full email address to confirm their identity
- System verifies the email matches the stored admin email
- Generates a secure reset token and stores it in Redis with 15-minute expiry
- Sends an email with a reset link to the admin's email address

### 2. Reset Password
- Admin clicks the link in their email
- Link takes them to `/admin/reset-password?token={token}&siteId={siteId}`
- Admin enters their new password (minimum 6 characters)
- System verifies the token hasn't expired
- Password is hashed and stored in Redis
- Reset token is deleted
- Confirmation email is sent

## API Integration

The functionality extends the existing `/api/auth` endpoint with three new actions:

### `GET /api/auth?action=get-admin-email&siteId={siteId}`
**Response:**
```json
{
  "success": true,
  "maskedEmail": "ad***@example.com",
  "siteExists": true
}
```

### `POST /api/auth?action=reset-password`
**Body:**
```json
{
  "siteId": "your-site-id",
  "email": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email address"
}
```

### `POST /api/auth?action=verify-reset`
**Body:**
```json
{
  "siteId": "your-site-id",
  "token": "reset-token-from-email",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Redis Data Structure

### Reset Tokens
- **Key:** `reset:{siteId}:{token}`
- **Value:** 
```json
{
  "email": "admin@example.com",
  "createdAt": "2025-07-27T12:00:00.000Z",
  "expiresAt": "2025-07-27T12:15:00.000Z"
}
```
- **TTL:** 900 seconds (15 minutes)

## Security Features

1. **Time-Limited Tokens:** Reset tokens expire after 15 minutes
2. **Single Use:** Tokens are deleted after use (successful or failed)
3. **Secure Token Generation:** Uses `crypto.randomBytes(32)` for token generation
4. **Password Hashing:** New passwords are hashed with bcrypt (12 rounds)
5. **Email Verification:** Only works with verified admin email addresses stored in Redis
6. **Email Confirmation:** Users must enter the full email address to confirm their identity
7. **Masked Email Display:** Shows partially masked email for security

## Email Integration

The functionality uses the existing Resend integration through `/api/utils/email.js`. Two types of emails are sent:

1. **Password Reset Request Email:** Contains the reset link
2. **Password Update Confirmation Email:** Confirms the password was changed

## UI Components

### AdminLogin.jsx
- Added "Forgot your password?" link
- Two-step password reset process:
  1. Enter Site ID to get masked admin email
  2. Confirm full email address to receive reset link
- Handles reset request submission with email verification

### ResetPassword.jsx (New)
- Dedicated page for handling password reset
- Validates reset tokens
- Handles password update submission
- Redirects to login after successful reset

## Routes

New routes added to App.jsx:
- `/admin/login` - Explicit login route
- `/admin/reset-password` - Password reset page

## Error Handling

The implementation includes comprehensive error handling for:
- Invalid or expired tokens
- Missing admin email addresses
- Email sending failures
- Password validation errors
- Network/Redis connection issues

## Dependencies

No new npm packages were required. The implementation uses existing dependencies:
- `crypto` (Node.js built-in)
- `bcryptjs` (already in use)
- Resend API (already configured)
- Redis (already in use)

## Testing

To test the password reset functionality:

1. Start the development server: `npm run dev`
2. Navigate to `/admin/login`
3. Click "Forgot your password?"
4. Enter a valid Site ID that has an admin email configured
5. Check the console/logs for email content (in development)
6. Use the reset link to set a new password

Note: In development, emails may not be sent if Resend API key is not configured, but the email content will be logged to the console.
