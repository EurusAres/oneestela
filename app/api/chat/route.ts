import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const bookingId = searchParams.get('bookingId');

    let query = `
      SELECT cm.*, u.full_name as sender_name, u.email as sender_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (senderId && receiverId) {
      // When both are provided and equal, fetch all messages involving this user
      // (messages sent by them OR sent to them, including NULL receiver for broadcast)
      if (senderId === receiverId) {
        query += ' AND (cm.sender_id = ? OR cm.receiver_id = ?)';
        params.push(senderId, receiverId);
      } else {
        // Fetch conversation between two different users (both directions)
        query += ' AND ((cm.sender_id = ? AND (cm.receiver_id = ? OR cm.receiver_id IS NULL)) OR (cm.sender_id = ? AND (cm.receiver_id = ? OR cm.receiver_id IS NULL)))';
        params.push(senderId, receiverId, receiverId, senderId);
      }
    } else if (senderId) {
      query += ' AND cm.sender_id = ?';
      params.push(senderId);
    } else if (receiverId) {
      query += ' AND cm.receiver_id = ?';
      params.push(receiverId);
    }

    if (bookingId) {
      query += ' AND booking_id = ?';
      params.push(bookingId);
    }

    query += ' ORDER BY cm.created_at ASC LIMIT 200';

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
    const { senderId, receiverId, bookingId, message, messageType, fileUrl, senderEmail } = await request.json();

    console.log('[Chat POST] Received:', { senderId, senderEmail, receiverId, messageType });

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Resolve senderId — if the provided senderId doesn't exist, try looking up by email
    let resolvedSenderId = senderId;

    if (senderId) {
      const check = await executeQuery('SELECT id FROM users WHERE id = ?', [senderId]) as any[];
      console.log('[Chat POST] Sender check for id', senderId, ':', check.length > 0 ? 'found' : 'not found');
      
      if (!check || check.length === 0) {
        // Session has stale id — try resolving by email
        if (senderEmail) {
          const byEmail = await executeQuery('SELECT id FROM users WHERE email = ?', [senderEmail]) as any[];
          console.log('[Chat POST] Email lookup for', senderEmail, ':', byEmail.length > 0 ? byEmail[0].id : 'not found');
          
          if (byEmail && byEmail.length > 0) {
            resolvedSenderId = byEmail[0].id;
          } else {
            return NextResponse.json(
              { error: 'Sender not found. Please log out and log back in.', code: 'SENDER_NOT_FOUND' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Sender not found. Please log out and log back in.', code: 'SENDER_NOT_FOUND' },
            { status: 400 }
          );
        }
      }
    } else {
      return NextResponse.json({ error: 'Missing senderId' }, { status: 400 });
    }

    console.log('[Chat POST] Inserting with resolvedSenderId:', resolvedSenderId);

    const result = await executeQuery(
      `INSERT INTO chat_messages 
       (sender_id, receiver_id, booking_id, message, message_type, file_url, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [resolvedSenderId, receiverId || null, bookingId || null, message, messageType || 'text', fileUrl || null, false]
    );

    console.log('[Chat POST] Success, insertId:', (result as any).insertId);

    return NextResponse.json(
      { message: 'Message sent', messageId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Chat POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error?.message },
      { status: 500 }
    );
  }
}
