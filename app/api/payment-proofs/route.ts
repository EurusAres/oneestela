import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const userId = searchParams.get('userId');

    let query = 'SELECT * FROM payment_proofs WHERE 1=1';
    const params: any[] = [];

    if (bookingId) {
      query += ' AND booking_id = ?';
      params.push(bookingId);
    }

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const proofs = await executeQuery(query, params);

    return NextResponse.json({ proofs });
  } catch (error) {
    console.error('Error fetching payment proofs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, userId, paymentMethod, amount, proofUrl } = await request.json();

    if (!bookingId || !userId || !amount || !proofUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO payment_proofs 
       (booking_id, user_id, payment_method, amount, proof_url, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bookingId, userId, paymentMethod, amount, proofUrl, 'pending']
    );

    return NextResponse.json(
      { message: 'Payment proof uploaded', proofId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'Payment proof ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.verifiedBy !== undefined) {
      updates.push('verified_by = ?');
      values.push(body.verifiedBy);
    }
    if (body.verifiedAt !== undefined) {
      updates.push('verified_at = ?');
      values.push(body.verifiedAt);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    await executeQuery(
      `UPDATE payment_proofs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({ message: 'Payment proof updated successfully' });
  } catch (error) {
    console.error('Error updating payment proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
