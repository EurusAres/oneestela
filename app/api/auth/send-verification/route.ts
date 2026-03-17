import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import nodemailer from 'nodemailer';

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUser] = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in database
    await executeQuery(
      `INSERT INTO email_verifications (email, code, expires_at, created_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE code = ?, expires_at = ?, created_at = NOW()`,
      [email, verificationCode, expiresAt, verificationCode, expiresAt]
    );

    // Get admin email from settings
    const [adminUser] = await executeQuery(
      "SELECT email FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
    ) as any[];

    if (!adminUser || !adminUser.email) {
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }

    // Configure email transporter using admin's email
    // Note: You'll need to set up SMTP credentials in environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || adminUser.email,
        pass: process.env.SMTP_PASSWORD || process.env.ADMIN_EMAIL_PASSWORD,
      },
    });

    // Send verification email
    const mailOptions = {
      from: `"One Estela Place" <${adminUser.email}>`,
      to: email,
      subject: 'Email Verification - One Estela Place',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #000; text-align: center; letter-spacing: 5px; padding: 20px; background-color: #fff; border: 2px dashed #000; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>One Estela Place</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${firstName}${lastName ? ' ' + lastName : ''}!</h2>
              <p>Thank you for signing up with One Estela Place. To complete your registration, please verify your email address.</p>
              <p>Your verification code is:</p>
              <div class="code">${verificationCode}</div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} One Estela Place. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Verification code sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send verification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
