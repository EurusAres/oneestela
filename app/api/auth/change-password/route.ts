import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword, email, code } = body;

    // Validate new password
    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Case 1: Password reset via email and verification code (forgot password flow)
    if (email && code) {
      // Verify the code
      const verifications = await executeQuery(
        'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW() AND used = FALSE',
        [email, code]
      ) as any[];

      if (verifications.length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        );
      }

      // Get user by email
      const users = await executeQuery(
        'SELECT id FROM users WHERE email = ?',
        [email]
      ) as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = users[0] as any;

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await executeQuery(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, user.id]
      );

      // Mark verification code as used
      await executeQuery(
        'UPDATE verification_codes SET used = TRUE WHERE email = ? AND code = ?',
        [email, code]
      );

      return NextResponse.json({
        message: 'Password reset successfully'
      });
    }

    // Case 2: Password change via userId and current password (logged-in user flow)
    if (userId && currentPassword) {
      // Get user's current password hash
      const users = await executeQuery(
        'SELECT id, password_hash FROM users WHERE id = ?',
        [userId]
      ) as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = users[0] as any;

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await executeQuery(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, userId]
      );

      return NextResponse.json({
        message: 'Password updated successfully'
      });
    }

    // If neither case is satisfied
    return NextResponse.json(
      { error: 'Invalid request. Provide either (userId + currentPassword) or (email + code)' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}