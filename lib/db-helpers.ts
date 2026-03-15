import { RowDataPacket } from 'mysql2/promise';
import { getPool } from './db';

async function getConnection() {
  const pool = await getPool();
  return pool.getConnection();
}

export async function getUserByEmail(email: string) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT id, email, full_name, role, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

export async function getUserBookings(userId: number) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT b.*, o.name as room_name, o.capacity, o.price_per_hour
       FROM bookings b
       JOIN office_rooms o ON b.office_room_id = o.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getAvailableRooms() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT o.*, v.name as venue_name
       FROM office_rooms o
       JOIN venues v ON o.venue_id = v.id
       WHERE o.is_available = true
       ORDER BY o.name ASC`
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function checkRoomAvailability(
  roomId: number,
  bookingDate: string,
  startTime: string,
  endTime: string
) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM bookings
       WHERE office_room_id = ?
       AND DATE(check_in_date) = ?
       AND status != 'cancelled'
       AND (check_in_date < ? AND check_out_date > ?)`,
      [roomId, bookingDate, `${bookingDate} ${endTime}`, `${bookingDate} ${startTime}`]
    );
    const result = rows[0] as { count: number };
    return result.count === 0;
  } finally {
    connection.release();
  }
}

export async function getContactMessages(status?: string) {
  const connection = await getConnection();
  try {
    let query = 'SELECT * FROM contact_messages';
    const params: any[] = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await connection.query<RowDataPacket[]>(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getRoomReviews(roomId: number) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT r.*, u.full_name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.office_room_id = ?
       ORDER BY r.created_at DESC`,
      [roomId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getRoomAverageRating(roomId: number) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
       FROM reviews WHERE office_room_id = ?`,
      [roomId]
    );
    const result = rows[0] as { average_rating: number | null; total_reviews: number };
    return { averageRating: result.average_rating || 0, totalReviews: result.total_reviews };
  } finally {
    connection.release();
  }
}

export async function getVenueStaff(venueId: number) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM staff WHERE venue_id = ? ORDER BY position ASC',
      [venueId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getChatHistory(userId: number, limit = 50) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );
    return (rows as RowDataPacket[]).reverse();
  } finally {
    connection.release();
  }
}

export async function getBookingPaymentProofs(bookingId: number) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM payment_proofs WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

export async function getBookingStats() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
       FROM bookings`
    );
    return rows[0];
  } finally {
    connection.release();
  }
}

export async function getRevenueStats() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        SUM(TIMESTAMPDIFF(HOUR, b.check_in_date, b.check_out_date) * o.price_per_hour) as total_revenue,
        AVG(TIMESTAMPDIFF(HOUR, b.check_in_date, b.check_out_date) * o.price_per_hour) as average_booking_value
       FROM bookings b
       JOIN office_rooms o ON b.office_room_id = o.id
       WHERE b.status = 'confirmed'`
    );
    return rows[0];
  } finally {
    connection.release();
  }
}
