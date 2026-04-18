import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, isPasswordReset } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // If explicitly for password reset, check verification_codes table only
    if (isPasswordReset) {
      const [passwordResetVerification] = await executeQuery(
        'SELECT code, expires_at, used FROM verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1',
        [email]
      ) as any[];

      if (!passwordResetVerification) {
        return NextResponse.json(
          { error: 'No verification code found for this email' },
          { status: 404 }
        );
      }

      console.log('Password reset verification lookup:', {
        email,
        found: true,
        storedCode: passwordResetVerification.code,
        used: passwordResetVerification.used
      });

      // Check if already used
      if (passwordResetVerification.used) {
        return NextResponse.json(
          { error: 'Verification code has already been used. Please request a new one.' },
          { status: 400 }
        );
      }

      // Check if code has expired
      const now = new Date();
      const expiresAt = new Date(passwordResetVerification.expires_at);
      
      if (now > expiresAt) {
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Verify code with robust comparison
      const resetStoredCode = String(passwordResetVerification.code).trim();
      const resetProvidedCode = String(code).trim();
      
      console.log('='.repeat(50));
      console.log('PASSWORD RESET CODE VERIFICATION');
      console.log('='.repeat(50));
      console.log('Email:', email);
      console.log('Stored code:', resetStoredCode);
      console.log('Provided code:', resetProvidedCode);
      console.log('Match:', resetStoredCode === resetProvidedCode);
      console.log('='.repeat(50));
      
      // More robust comparison - handle both string and number types
      const codesMatch = resetStoredCode === resetProvidedCode || 
                        String(passwordResetVerification.code) === String(code) ||
                        parseInt(resetStoredCode) === parseInt(resetProvidedCode);
      
      if (!codesMatch) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Don't mark as used yet - will be marked when password is actually reset
      return NextResponse.json({
        message: 'Code verified successfully',
        verified: true
      });
    }

    // For email verification (new user registration), check email_verifications table
    const [emailVerification] = await executeQuery(
      'SELECT code, expires_at FROM email_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    ) as any[];

    console.log('Email verification lookup:', {
      email,
      found: !!emailVerification,
      storedCode: emailVerification?.code
    });

    if (!emailVerification) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 404 }
      );
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(emailVerification.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify code with robust comparison
    const emailStoredCode = String(emailVerification.code).trim();
    const emailProvidedCode = String(code).trim();
    
    console.log('='.repeat(50));
    console.log('EMAIL VERIFICATION DEBUG');
    console.log('='.repeat(50));
    console.log('Email:', email);
    console.log('Stored code (raw):', emailVerification.code);
    console.log('Stored code (string):', emailStoredCode);
    console.log('Provided code (string):', emailProvidedCode);
    console.log('Match:', emailStoredCode === emailProvidedCode);
    console.log('='.repeat(50));
    
    // More robust comparison - handle both string and number types
    const codesMatch = emailStoredCode === emailProvidedCode || 
                      String(emailVerification.code) === String(code) ||
                      parseInt(emailStoredCode) === parseInt(emailProvidedCode);
    
    if (!codesMatch) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark as verified
    await executeQuery(
      'UPDATE email_verifications SET verified = TRUE WHERE email = ?',
      [email]
    );

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
