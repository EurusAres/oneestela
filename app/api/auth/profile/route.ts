import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, phone, address, emergencyContact } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await executeQuery(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [name, phone || null, userId]
    );

    // Upsert extended info into user_info table
    await executeQuery(
      `INSERT INTO user_info (user_id, address, contact_number)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE address = VALUES(address), contact_number = VALUES(contact_number)`,
      [userId, address || null, emergencyContact || null]
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const rows = await executeQuery(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role,
              ui.address, ui.contact_number as emergencyContact
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.user_id
       WHERE u.id = ?`,
      [userId]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
