import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // Summary counts
    const [[totals]] = await Promise.all([
      executeQuery(`
        SELECT
          COUNT(*) as total_bookings,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          COALESCE(SUM(total_price), 0) as total_revenue
        FROM bookings
      `) as any,
    ]);

    // Active users
    const [[userStats]] = await Promise.all([
      executeQuery(`SELECT COUNT(*) as total_users FROM users WHERE role = 'user'`) as any,
    ]);

    // Average rating
    const [[ratingStats]] = await Promise.all([
      executeQuery(`SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE is_approved = 1`) as any,
    ]);

    // Recent bookings (last 10)
    const recentBookings = await executeQuery(`
      SELECT b.id, b.status, b.check_in_date, b.check_out_date, b.total_price,
             b.special_requests, b.created_at,
             u.full_name as client_name, u.email as client_email,
             o.name as room_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN office_rooms o ON b.office_room_id = o.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `) as any[];

    // Monthly bookings (last 6 months)
    const monthlyBookings = await executeQuery(`
      SELECT DATE_FORMAT(check_in_date, '%Y-%m') as month, COUNT(*) as count
      FROM bookings
      WHERE check_in_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `) as any[];

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await executeQuery(`
      SELECT DATE_FORMAT(check_in_date, '%Y-%m') as month,
             COALESCE(SUM(total_price), 0) as amount
      FROM bookings
      WHERE check_in_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status IN ('confirmed', 'completed')
      GROUP BY month
      ORDER BY month ASC
    `) as any[];

    // Bookings by event type (using special_requests as proxy, or just count by room)
    const bookingsByRoom = await executeQuery(`
      SELECT o.name as area, COUNT(*) as count
      FROM bookings b
      JOIN office_rooms o ON b.office_room_id = o.id
      GROUP BY o.id, o.name
      ORDER BY count DESC
    `) as any[];

    // Booking status breakdown
    const statusBreakdown = await executeQuery(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(total_price), 0) as amount
      FROM bookings
      GROUP BY status
    `) as any[];

    // New user signups per month (last 6 months)
    const newSignups = await executeQuery(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND role = 'user'
      GROUP BY month
      ORDER BY month ASC
    `) as any[];

    // Top customers by booking count
    const topCustomers = await executeQuery(`
      SELECT u.full_name as name, COUNT(b.id) as bookings,
             COALESCE(SUM(b.total_price), 0) as revenue
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      GROUP BY u.id, u.full_name
      ORDER BY revenue DESC
      LIMIT 5
    `) as any[];

    // Contact messages stats
    const [[msgStats]] = await Promise.all([
      executeQuery(`
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
               SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
        FROM contact_messages
      `) as any,
    ]);

    // This month vs last month bookings
    const [[thisMonth]] = await Promise.all([
      executeQuery(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
      `) as any,
    ]);

    const [[lastMonth]] = await Promise.all([
      executeQuery(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
          AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
      `) as any,
    ]);

    return NextResponse.json({
      summary: {
        totalBookings: totals.total_bookings,
        confirmed: totals.confirmed,
        pending: totals.pending,
        cancelled: totals.cancelled,
        completed: totals.completed,
        totalRevenue: parseFloat(totals.total_revenue),
        totalUsers: userStats.total_users,
        avgRating: parseFloat(ratingStats.avg_rating).toFixed(1),
        totalReviews: ratingStats.total_reviews,
        unreadMessages: msgStats.unread,
        totalMessages: msgStats.total,
      },
      thisMonth: {
        bookings: thisMonth.count,
        revenue: parseFloat(thisMonth.revenue),
      },
      lastMonth: {
        bookings: lastMonth.count,
        revenue: parseFloat(lastMonth.revenue),
      },
      recentBookings,
      monthlyBookings,
      monthlyRevenue,
      bookingsByRoom,
      statusBreakdown,
      newSignups,
      topCustomers,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
