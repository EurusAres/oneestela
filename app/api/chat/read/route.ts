import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { senderId } = await request.json();
    if (!senderId) return NextResponse.json({ error: 'Missing senderId' }, { status: 400 });

    await executeQuery(
      'UPDATE chat_messages SET is_read = 1 WHERE sender_id = ? AND is_read = 0',
      [senderId]
    );

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
