import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officeRoomId = searchParams.get('officeRoomId');
    const approved = searchParams.get('approved') === 'true';

    let query = `
      SELECT r.*, u.full_name, o.name as room_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN office_rooms o ON r.office_room_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (officeRoomId) {
      query += ' AND r.office_room_id = ?';
      params.push(officeRoomId);
    }

    if (approved) {
      query += ' AND r.is_approved = 1';
    }

    query += ' ORDER BY r.created_at DESC';

    const reviews = await executeQuery(query, params);

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, officeRoomId, bookingId, rating, title, reviewText } = await request.json();

    if (!userId || !officeRoomId || !rating || !reviewText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO reviews 
       (user_id, office_room_id, booking_id, rating, title, review_text, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, officeRoomId, bookingId || null, rating, title, reviewText, false]
    );

    return NextResponse.json(
      { message: 'Review submitted', reviewId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
