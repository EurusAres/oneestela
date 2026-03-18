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

    console.log('Verification lookup:', {
      email,
      found: !!verification,
      storedCode: verification?.code,
      storedCodeType: typeof verification?.code
    });

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

    // Verify code (ensure both are strings and trimmed)
    const storedCode = String(verification.code).trim();
    const providedCode = String(code).trim();
    
    console.log('='.repeat(50));
    console.log('CODE VERIFICATION ATTEMPT');
    console.log('='.repeat(50));
    console.log('Email:', email);
    console.log('Stored code:', storedCode);
    console.log('Stored code length:', storedCode.length);
    console.log('Stored code type:', typeof storedCode);
    console.log('Provided code:', providedCode);
    console.log('Provided code length:', providedCode.length);
    console.log('Provided code type:', typeof providedCode);
    console.log('Match:', storedCode === providedCode);
    console.log('Character comparison:');
    for (let i = 0; i < Math.max(storedCode.length, providedCode.length); i++) {
      console.log(`  [${i}] stored: '${storedCode[i]}' (${storedCode.charCodeAt(i)}) vs provided: '${providedCode[i]}' (${providedCode.charCodeAt(i)})`);
    }
    console.log('='.repeat(50));
    
    if (storedCode !== providedCode) {
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
