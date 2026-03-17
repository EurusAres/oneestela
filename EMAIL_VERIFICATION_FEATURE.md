# Email Verification Feature Documentation

## Overview
This feature implements email verification for customer registration to ensure security and validate email addresses. When a customer signs up, they receive a 6-digit verification code sent from the admin's email address.

## Features Implemented

### 1. Two-Step Registration Process
- **Step 1**: Customer fills in registration details (name, email, password)
- **Step 2**: Customer receives and enters a 6-digit verification code

### 2. Email Verification System
- Generates random 6-digit verification codes
- Codes expire after 10 minutes
- Sends verification emails using admin's email address
- Professional HTML email template with branding

### 3. Security Features
- Email uniqueness validation
- Code expiration (10 minutes)
- Password strength requirements (minimum 6 characters)
- Resend code functionality (disabled for first 60 seconds to prevent spam)
- Countdown timer showing remaining time

## Files Created/Modified

### New Files Created:

1. **`app/api/auth/send-verification/route.ts`**
   - API endpoint to send verification codes
   - Generates 6-digit codes
   - Sends emails using nodemailer
   - Uses admin email as sender

2. **`app/api/auth/verify-code/route.ts`**
   - API endpoint to verify codes
   - Checks code validity and expiration
   - Marks email as verified

3. **`app/api/auth/update-email/route.ts`**
   - API endpoint for admin to update their email
   - Validates password before updating
   - Checks for duplicate emails

4. **`components/admin-settings-dialog.tsx`**
   - Admin settings dialog with tabs
   - Email update functionality
   - Password change functionality
   - Replaces "Change Password" button for admin

5. **`scripts/create-email-verification-table.sql`**
   - SQL schema for email_verifications table

6. **`scripts/setup-email-verification.js`**
   - Script to create the verification table

### Modified Files:

1. **`components/signup-dialog.tsx`**
   - Added two-step registration flow
   - Verification code input screen
   - Countdown timer (10 minutes)
   - Resend code functionality
   - Back button to return to signup form

2. **`components/main-layout.tsx`**
   - Admin users see "Settings" button
   - Staff users see "Change Password" button
   - Conditional rendering based on role

3. **`.env.example`**
   - Added SMTP configuration variables

## Database Schema

### `email_verifications` Table
```sql
CREATE TABLE email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_email (email),
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer @types/nodemailer
```

### 2. Create Database Table
```bash
node scripts/setup-email-verification.js
```

### 3. Configure Email Settings

#### For Gmail:
1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to Google Account > Security > 2-Step Verification > App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. Add to `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_admin_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

#### For Other Email Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **Custom SMTP**: Use your provider's settings

### 4. Update Admin Email
1. Log in as admin
2. Click "Settings" button in sidebar
3. Go to "Email" tab
4. Enter new email and current password
5. Click "Update Email"

## User Flow

### Customer Registration Flow:
1. Customer clicks "Sign Up" button
2. Fills in: First Name, Last Name, Email, Password, Confirm Password
3. Clicks "Continue"
4. System sends 6-digit code to customer's email
5. Customer enters the code on verification screen
6. System verifies code and creates account
7. Customer is automatically logged in

### Verification Screen Features:
- Large input field for 6-digit code
- Countdown timer (10:00 to 0:00)
- "Back to signup" button
- "Resend code" button (enabled after 60 seconds)
- Clear instructions and email reminder

## Email Template

The verification email includes:
- Professional header with "One Estela Place" branding
- Personalized greeting with customer's name
- Large, centered 6-digit code
- Expiration notice (10 minutes)
- Professional footer with copyright

## API Endpoints

### POST `/api/auth/send-verification`
**Request Body:**
```json
{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "Verification code sent successfully",
  "expiresIn": 600
}
```

### POST `/api/auth/verify-code`
**Request Body:**
```json
{
  "email": "customer@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

### PUT `/api/auth/update-email`
**Request Body:**
```json
{
  "userId": "1",
  "newEmail": "newemail@example.com",
  "password": "current_password"
}
```

**Response:**
```json
{
  "message": "Email updated successfully",
  "email": "newemail@example.com"
}
```

## Security Considerations

1. **Code Expiration**: Codes expire after 10 minutes
2. **Rate Limiting**: Resend disabled for 60 seconds after sending
3. **Email Validation**: Checks for existing emails before sending codes
4. **Password Verification**: Admin must verify password to change email
5. **Unique Codes**: Each email gets a unique code stored in database
6. **HTTPS Required**: Use HTTPS in production for secure transmission

## Troubleshooting

### Email Not Sending:
1. Check SMTP credentials in `.env`
2. Verify admin email is set correctly
3. Check if Gmail App Password is correct (not regular password)
4. Check spam/junk folder
5. Review server logs for error messages

### Code Not Working:
1. Check if code has expired (10 minutes)
2. Verify code was entered correctly (6 digits)
3. Check database for verification record
4. Try resending a new code

### Admin Email Not Updating:
1. Verify current password is correct
2. Check if new email is already in use
3. Ensure admin is logged in
4. Check database connection

## Testing

### Test Email Verification:
1. Use a real email address you can access
2. Fill in signup form
3. Check email inbox (and spam folder)
4. Enter the 6-digit code
5. Verify account is created successfully

### Test Code Expiration:
1. Request verification code
2. Wait 10+ minutes
3. Try to verify with expired code
4. Should show "Verification code has expired" error

### Test Resend Functionality:
1. Request verification code
2. Wait 60 seconds
3. Click "Resend code"
4. Check for new email with different code

## Production Deployment

1. **Use Environment Variables**: Never commit SMTP credentials
2. **Enable HTTPS**: Required for secure email transmission
3. **Configure Email Provider**: Use reliable SMTP service (SendGrid, AWS SES, etc.)
4. **Monitor Email Delivery**: Set up logging for failed emails
5. **Rate Limiting**: Implement additional rate limiting if needed
6. **Backup Admin Email**: Keep admin email credentials secure

## Future Enhancements

- SMS verification as alternative
- Email verification for password reset
- Customizable email templates
- Multi-language support for emails
- Email delivery status tracking
- Admin dashboard for verification statistics
