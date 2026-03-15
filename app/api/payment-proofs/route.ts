import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM payment_proofs WHERE 1=1';
    const params: any[] = [];

    if (id) {
      query += ' AND id = ?';
      params.push(id);
    }

    if (bookingId) {
      query += ' AND booking_id = ?';
      params.push(bookingId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY uploaded_at DESC';

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
    const {
      bookingId,
      fileId,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      paymentMethod,
      paymentAmount,
      paymentDate,
      paymentReference,
    } = await request.json();

    if (!bookingId || !fileId || !fileName || !paymentMethod || !paymentAmount || !paymentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO payment_proofs 
       (booking_id, file_id, file_name, file_url, file_size, file_type, payment_method, payment_amount, payment_date, payment_reference, status, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [bookingId, fileId, fileName, fileUrl, fileSize, fileType, paymentMethod, paymentAmount, paymentDate, paymentReference || null]
    );

    const insertId = (result as any).insertId;

    // Fetch the created proof
    const [proof] = await executeQuery('SELECT * FROM payment_proofs WHERE id = ?', [insertId]) as any[];

    return NextResponse.json(proof, { status: 201 });
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
        { error: 'Missing proof ID' },
        { status: 400 }
      );
    }

    const { status, verifiedBy, adminNote } = await request.json();

    await executeQuery(
      `UPDATE payment_proofs 
       SET status = ?, verified_by = ?, verified_at = NOW(), admin_note = ?
       WHERE id = ?`,
      [status, verifiedBy, adminNote || null, id]
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
