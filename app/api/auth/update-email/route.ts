import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newEmail, password } = body;

    if (!userId || !newEmail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user data
    const [user] = await executeQuery(
      'SELECT password_hash, email FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new email is already in use by another user
    const [existingUser] = await executeQuery(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [newEmail, userId]
    ) as any[];

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 400 }
      );
    }

    // Update email
    await executeQuery(
      'UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?',
      [newEmail, userId]
    );

    return NextResponse.json({
      message: 'Email updated successfully',
      email: newEmail
    });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
