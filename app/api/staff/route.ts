import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const query = `
      SELECT s.*, u.full_name, u.email
      FROM staff s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = ?
      ORDER BY u.full_name ASC
    `;

    const staff = await executeQuery(query, [status]);

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, position, department, hireDate, salary } = await request.json();

    if (!userId || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO staff 
       (user_id, position, department, hire_date, salary, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, position, department, hireDate, salary, 'active']
    );

    return NextResponse.json(
      { message: 'Staff member added', staffId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
