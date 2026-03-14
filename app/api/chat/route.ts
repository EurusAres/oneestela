import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const bookingId = searchParams.get('bookingId');

    let query = 'SELECT * FROM chat_messages WHERE 1=1';
    const params: any[] = [];

    if (senderId) {
      query += ' AND sender_id = ?';
      params.push(senderId);
    }

    if (receiverId) {
      query += ' AND receiver_id = ?';
      params.push(receiverId);
    }

    if (bookingId) {
      query += ' AND booking_id = ?';
      params.push(bookingId);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const messages = await executeQuery(query, params);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, bookingId, message, messageType, fileUrl } = await request.json();

    if (!senderId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO chat_messages 
       (sender_id, receiver_id, booking_id, message, message_type, file_url, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [senderId, receiverId || null, bookingId || null, message, messageType || 'text', fileUrl || null, false]
    );

    return NextResponse.json(
      { message: 'Message sent', messageId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
