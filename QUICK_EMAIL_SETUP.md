# Quick Email Setup Guide

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the prompts to enable it

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select your device
4. Click "Generate"
5. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_admin_email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # (remove spaces: abcdefghijklmnop)
```

## Testing the Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Registration
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in the form with a real email you can access
4. Click "Continue"
5. Check your email for the 6-digit code
6. Enter the code and complete registration

### 3. Check for Issues
If email doesn't arrive:
- Check spam/junk folder
- Verify SMTP credentials in .env
- Check console for error messages
- Ensure 2-Step Verification is enabled
- Verify App Password is correct (no spaces)

## Alternative: Using Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_admin_email@outlook.com
SMTP_PASSWORD=your_outlook_password
```

## Alternative: Using Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_admin_email@yahoo.com
SMTP_PASSWORD=your_yahoo_app_password
```

Note: Yahoo also requires an App Password. Generate it at:
https://login.yahoo.com/account/security

## Troubleshooting

### "Invalid login" Error
- Double-check SMTP_USER and SMTP_PASSWORD
- Ensure no extra spaces in credentials
- Verify 2-Step Verification is enabled (Gmail)
- Use App Password, not regular password

### "Connection timeout" Error
- Check SMTP_HOST and SMTP_PORT
- Verify firewall isn't blocking port 587
- Try port 465 with secure: true

### Email Goes to Spam
- Add "One Estela Place" to contacts
- Mark email as "Not Spam"
- Consider using a professional email service in production

## Production Recommendations

For production, consider using:
- **SendGrid**: https://sendgrid.com
- **AWS SES**: https://aws.amazon.com/ses/
- **Mailgun**: https://www.mailgun.com
- **Postmark**: https://postmarkapp.com

These services offer better deliverability and monitoring.
