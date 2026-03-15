import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // Get all users who have ever sent a message, with the latest message in their thread
    // and unread count (messages from user that haven't been read)
    const rows = await executeQuery(`
      SELECT
        u.id as userId,
        u.full_name as userName,
        u.email as userEmail,
        latest.message as lastMessage,
        latest.created_at as lastTime,
        COALESCE(unread.cnt, 0) as unread
      FROM users u
      INNER JOIN (
        SELECT
          CASE WHEN sender_id IN (SELECT id FROM users WHERE role = 'user') THEN sender_id ELSE receiver_id END as user_id,
          message,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN sender_id IN (SELECT id FROM users WHERE role = 'user') THEN sender_id ELSE receiver_id END
            ORDER BY created_at DESC
          ) as rn
        FROM chat_messages
        WHERE sender_id IN (SELECT id FROM users WHERE role = 'user')
           OR receiver_id IN (SELECT id FROM users WHERE role = 'user')
      ) latest ON latest.user_id = u.id AND latest.rn = 1
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as cnt
        FROM chat_messages
        WHERE is_read = 0
          AND sender_id IN (SELECT id FROM users WHERE role = 'user')
        GROUP BY sender_id
      ) unread ON unread.sender_id = u.id
      WHERE u.role = 'user'
      ORDER BY latest.created_at DESC
    `) as any[];

    return NextResponse.json({ conversations: rows });
  } catch (error) {
    console.error('Conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
