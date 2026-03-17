import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Get verification record
    const [verification] = await executeQuery(
      'SELECT code, expires_at FROM email_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    ) as any[];

    if (!verification) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 404 }
      );
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(verification.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify code
    if (verification.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark as verified (optional: update a verified flag)
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
