import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        pp.*,
        u.full_name as customer_name,
        u.email as customer_email,
        b.check_in_date,
        b.check_out_date,
        b.special_requests as event_name,
        o.name as room_name
      FROM payment_proofs pp
      LEFT JOIN users u ON pp.user_id = u.id
      LEFT JOIN bookings b ON pp.booking_id = b.id
      LEFT JOIN office_rooms o ON b.office_room_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (id) {
      query += ' AND pp.id = ?';
      params.push(id);
    }

    if (bookingId) {
      query += ' AND pp.booking_id = ?';
      params.push(bookingId);
    }

    if (status) {
      query += ' AND pp.status = ?';
      params.push(status);
    }

    query += ' ORDER BY pp.created_at DESC';

    const proofs = await executeQuery(query, params);

    return NextResponse.json({ proofs });
  } catch (error) {
    console.error('Error fetching payment proofs:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      bookingId,
      userId,
      fileUrl,
      paymentMethod,
      paymentAmount,
    } = await request.json();

    if (!bookingId || !userId || !fileUrl || !paymentMethod || !paymentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start transaction - insert payment proof and update booking amount
    const result = await executeQuery(
      `INSERT INTO payment_proofs 
       (booking_id, user_id, payment_method, amount, proof_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [bookingId, userId, paymentMethod, paymentAmount, fileUrl]
    );

    const insertId = (result as any).insertId;

    // Update the booking's total_price with the payment amount
    await executeQuery(
      `UPDATE bookings 
       SET total_price = ?
       WHERE id = ?`,
      [paymentAmount, bookingId]
    );

    // Fetch the created proof
    const [proof] = await executeQuery('SELECT * FROM payment_proofs WHERE id = ?', [insertId]) as any[];

    return NextResponse.json(proof, { status: 201 });
  } catch (error) {
    console.error('Error creating payment proof:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing proof ID' },
        { status: 400 }
      );
    }

    const { status, verificationNotes } = await request.json();

    await executeQuery(
      `UPDATE payment_proofs 
       SET status = ?, verification_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, verificationNotes || null, id]
    );

    const [proof] = await executeQuery('SELECT * FROM payment_proofs WHERE id = ?', [id]) as any[];

    return NextResponse.json(proof);
  } catch (error) {
    console.error('Error updating payment proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
