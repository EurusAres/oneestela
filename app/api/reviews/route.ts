import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officeRoomId = searchParams.get('officeRoomId');
    const venueId = searchParams.get('venueId');
    const approved = searchParams.get('approved');

    let query = `
      SELECT r.*, 
             u.full_name, 
             o.name as room_name,
             v.name as venue_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN office_rooms o ON r.office_room_id = o.id
      LEFT JOIN venues v ON r.venue_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (officeRoomId) {
      query += ' AND r.office_room_id = ?';
      params.push(officeRoomId);
    }

    if (venueId) {
      query += ' AND r.venue_id = ?';
      params.push(venueId);
    }

    if (approved === 'true') {
      query += ' AND r.is_approved = 1';
    } else if (approved === 'false') {
      query += ' AND r.is_approved = 0';
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
    const { userId, officeRoomId, venueId, bookingId, rating, title, reviewText } = await request.json();

    if (!userId || !rating || !reviewText) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, rating, and reviewText are required' },
        { status: 400 }
      );
    }

    // Must have either officeRoomId or venueId, but not both
    if (!officeRoomId && !venueId) {
      return NextResponse.json(
        { error: 'Either officeRoomId or venueId must be provided' },
        { status: 400 }
      );
    }

    if (officeRoomId && venueId) {
      return NextResponse.json(
        { error: 'Cannot specify both officeRoomId and venueId' },
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
       (user_id, office_room_id, venue_id, booking_id, rating, title, review_text, is_approved, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, officeRoomId || null, venueId || null, bookingId || null, rating, title || '', reviewText, false, false]
    );

    return NextResponse.json(
      { message: 'Review submitted successfully', reviewId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { reviewId, action } = await request.json();

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Missing reviewId or action' },
        { status: 400 }
      );
    }

    let query = '';
    let params: any[] = [];

    switch (action) {
      case 'approve':
        query = 'UPDATE reviews SET is_approved = 1 WHERE id = ?';
        params = [reviewId];
        break;
      case 'unapprove':
        query = 'UPDATE reviews SET is_approved = 0 WHERE id = ?';
        params = [reviewId];
        break;
      case 'feature':
        query = 'UPDATE reviews SET is_featured = 1, is_approved = 1 WHERE id = ?';
        params = [reviewId];
        break;
      case 'unfeature':
        query = 'UPDATE reviews SET is_featured = 0 WHERE id = ?';
        params = [reviewId];
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await executeQuery(query, params);

    return NextResponse.json({ message: `Review ${action}d successfully` });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Missing reviewId' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM reviews WHERE id = ?', [reviewId]);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
