import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from './db';

/**
 * Get a single user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT id, email, full_name, role, created_at FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: number) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT b.*, or.name as room_name, or.capacity, or.price_per_hour
       FROM bookings b
       JOIN office_rooms or ON b.office_room_id = or.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [userId]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

/**
 * Get all available rooms with their details
 */
export async function getAvailableRooms() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT or.*, v.name as venue_name
       FROM office_rooms or
       JOIN venues v ON or.venue_id = v.id
       WHERE or.is_available = true
       ORDER BY or.name ASC`
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
}

/**
 * Check if a room is available for a specific date and time
 */
export async function checkRoomAvailability(
  roomId: number,
  bookingDate: string,
  startTime: string,
  endTime: string
) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM bookings
       WHERE office_room_id = ?
       AND booking_date = ?
       AND status != 'cancelled'
       AND (
         (start_time < ? AND end_time > ?)
         OR (start_time < ? AND end_time > ?)
         OR (start_time >= ? AND end_time <= ?)
       )`,
      [roomId, bookingDate, endTime, startTime, startTime, endTime, startTime, endTime]
    );
    connection.release();
    const result = rows[0] as { count: number };
    return result.count === 0;
  } catch (error) {
    console.error('Error checking room availability:', error);
    throw error;
  }
}

/**
 * Get all contact messages with optional filtering
 */
export async function getContactMessages(status?: string) {
  try {
    const connection = await db.getConnection();
    let query = 'SELECT * FROM contact_messages';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await connection.query<RowDataPacket[]>(query, params);
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    throw error;
  }
}

/**
 * Get reviews for a specific room
 */
export async function getRoomReviews(roomId: number) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT r.*, u.full_name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.office_room_id = ?
       ORDER BY r.created_at DESC`,
      [roomId]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching room reviews:', error);
    throw error;
  }
}

/**
 * Get average rating for a room
 */
export async function getRoomAverageRating(roomId: number) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
       FROM reviews
       WHERE office_room_id = ?`,
      [roomId]
    );
    connection.release();
    const result = rows[0] as { average_rating: number | null; total_reviews: number };
    return {
      averageRating: result.average_rating || 0,
      totalReviews: result.total_reviews
    };
  } catch (error) {
    console.error('Error fetching room rating:', error);
    throw error;
  }
}

/**
 * Get staff members for a venue
 */
export async function getVenueStaff(venueId: number) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM staff WHERE venue_id = ? ORDER BY position ASC',
      [venueId]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching venue staff:', error);
    throw error;
  }
}

/**
 * Get chat messages between a user and admin
 */
export async function getChatHistory(userId: number, limit = 50) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM chat_messages
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    connection.release();
    return rows.reverse(); // Show oldest first
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

/**
 * Get payment proofs for a booking
 */
export async function getBookingPaymentProofs(bookingId: number) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM payment_proofs WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching payment proofs:', error);
    throw error;
  }
}

/**
 * Get total booking count for dashboard
 */
export async function getBookingStats() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
       FROM bookings`
    );
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
}

/**
 * Get total revenue from confirmed bookings
 */
export async function getRevenueStats() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        SUM(HOUR(TIMEDIFF(b.end_time, b.start_time)) * or.price_per_hour) as total_revenue,
        AVG(HOUR(TIMEDIFF(b.end_time, b.start_time)) * or.price_per_hour) as average_booking_value
       FROM bookings b
       JOIN office_rooms or ON b.office_room_id = or.id
       WHERE b.status = 'confirmed'`
    );
    connection.release();
    return rows[0];
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
}
