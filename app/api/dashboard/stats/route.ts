import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching dashboard stats...');
    
    // Summary counts - handle missing tables gracefully
    let totals = {
      total_bookings: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0,
      total_revenue: 0
    };

    try {
      const [totalResults] = await executeQuery(`
        SELECT
          COUNT(*) as total_bookings,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          COALESCE(SUM(total_price), 0) as total_revenue
        FROM bookings
      `) as any;
      totals = totalResults;
    } catch (error) {
      console.log('Bookings table not found, using defaults');
    }

    // Active users
    let userStats = { total_users: 0 };
    try {
      const [userResults] = await executeQuery(`SELECT COUNT(*) as total_users FROM users WHERE role = 'user'`) as any;
      userStats = userResults;
    } catch (error) {
      console.log('Users table not found, using defaults');
    }

    // Recent bookings - handle missing joins gracefully
    let recentBookings: any[] = [];
    try {
      recentBookings = await executeQuery(`
        SELECT 
          b.id, 
          b.status, 
          b.check_in_date, 
          b.check_out_date, 
          b.total_price,
          b.number_of_guests,
          b.special_requests, 
          b.created_at,
          b.updated_at,
          COALESCE(u.full_name, 'Unknown User') as client_name, 
          COALESCE(u.email, '') as client_email,
          COALESCE(u.phone, '') as client_phone,
          'Office Space' as room_name,
          0 as room_capacity
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
        LIMIT 10
      `) as any[];
    } catch (error) {
      console.log('Error fetching recent bookings:', error);
    }

    // Monthly bookings (last 6 months)
    let monthlyBookings: any[] = [];
    try {
      monthlyBookings = await executeQuery(`
        SELECT DATE_FORMAT(check_in_date, '%Y-%m') as month, COUNT(*) as count
        FROM bookings
        WHERE check_in_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `) as any[];
    } catch (error) {
      console.log('Error fetching monthly bookings:', error);
    }

    // Monthly revenue (last 6 months)
    let monthlyRevenue: any[] = [];
    try {
      monthlyRevenue = await executeQuery(`
        SELECT DATE_FORMAT(check_in_date, '%Y-%m') as month,
               COALESCE(SUM(total_price), 0) as amount
        FROM bookings
        WHERE check_in_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND status IN ('confirmed', 'completed')
        GROUP BY month
        ORDER BY month ASC
      `) as any[];
    } catch (error) {
      console.log('Error fetching monthly revenue:', error);
    }

    // Bookings by room - simplified
    let bookingsByRoom: any[] = [];
    try {
      bookingsByRoom = await executeQuery(`
        SELECT 'Office Spaces' as area, COUNT(*) as count
        FROM bookings
        WHERE event_type LIKE 'office-%'
        UNION ALL
        SELECT 'Event Venues' as area, COUNT(*) as count
        FROM bookings
        WHERE event_type NOT LIKE 'office-%'
      `) as any[];
    } catch (error) {
      console.log('Error fetching bookings by room:', error);
    }

    // Booking status breakdown
    let statusBreakdown: any[] = [];
    try {
      statusBreakdown = await executeQuery(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(total_price), 0) as amount
        FROM bookings
        GROUP BY status
      `) as any[];
    } catch (error) {
      console.log('Error fetching status breakdown:', error);
    }

    // New user signups per month (last 6 months)
    let newSignups: any[] = [];
    try {
      newSignups = await executeQuery(`
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND role = 'user'
        GROUP BY month
        ORDER BY month ASC
      `) as any[];
    } catch (error) {
      console.log('Error fetching new signups:', error);
    }

    // Reviews stats
    let reviewStats = { total_reviews: 0, avg_rating: null, approved_reviews: 0, featured_reviews: 0 };
    try {
      const [reviewResults] = await executeQuery(`
        SELECT COUNT(*) as total_reviews,
               AVG(rating) as avg_rating,
               SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved_reviews,
               SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_reviews
        FROM reviews
      `) as any;
      reviewStats = reviewResults;
    } catch (error) {
      console.log('Reviews table not found, using defaults');
    }

    // Recent reviews
    let recentReviews: any[] = [];
    try {
      recentReviews = await executeQuery(`
        SELECT r.*, 
               COALESCE(u.full_name, 'Anonymous') as full_name,
               'Office Space' as room_name,
               'One Estela Place' as venue_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.is_approved = 1
        ORDER BY r.created_at DESC
        LIMIT 5
      `) as any[];
    } catch (error) {
      console.log('Error fetching recent reviews:', error);
    }

    // Contact messages stats
    let msgStats = { total: 0, unread: 0, replied: 0 };
    try {
      const [msgResults] = await executeQuery(`
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
               SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
        FROM contact_messages
      `) as any;
      msgStats = msgResults;
    } catch (error) {
      console.log('Contact messages table not found, using defaults');
    }

    // This month vs last month bookings
    let thisMonth = { count: 0, revenue: 0 };
    let lastMonth = { count: 0, revenue: 0 };
    
    try {
      const [thisMonthResults] = await executeQuery(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
      `) as any;
      thisMonth = thisMonthResults;
    } catch (error) {
      console.log('Error fetching this month stats:', error);
    }

    try {
      const [lastMonthResults] = await executeQuery(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
        FROM bookings
        WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
          AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
      `) as any;
      lastMonth = lastMonthResults;
    } catch (error) {
      console.log('Error fetching last month stats:', error);
    }

    return NextResponse.json({
      summary: {
        totalBookings: totals.total_bookings || 0,
        confirmed: totals.confirmed || 0,
        pending: totals.pending || 0,
        cancelled: totals.cancelled || 0,
        completed: totals.completed || 0,
        totalRevenue: parseFloat(totals.total_revenue || '0'),
        totalUsers: userStats.total_users || 0,
        unreadMessages: msgStats.unread || 0,
        totalMessages: msgStats.total || 0,
        totalReviews: reviewStats.total_reviews || 0,
        avgRating: reviewStats.avg_rating ? parseFloat(reviewStats.avg_rating).toFixed(1) : null,
        approvedReviews: reviewStats.approved_reviews || 0,
        featuredReviews: reviewStats.featured_reviews || 0,
      },
      thisMonth: {
        bookings: thisMonth.count || 0,
        revenue: parseFloat(thisMonth.revenue || '0'),
      },
      lastMonth: {
        bookings: lastMonth.count || 0,
        revenue: parseFloat(lastMonth.revenue || '0'),
      },
      recentBookings: recentBookings || [],
      recentReviews: recentReviews || [],
      monthlyBookings: monthlyBookings || [],
      monthlyRevenue: monthlyRevenue || [],
      bookingsByRoom: bookingsByRoom || [],
      statusBreakdown: statusBreakdown || [],
      newSignups: newSignups || [],
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      summary: {
        totalBookings: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        completed: 0,
        totalRevenue: 0,
        totalUsers: 0,
        unreadMessages: 0,
        totalMessages: 0,
        totalReviews: 0,
        avgRating: null,
        approvedReviews: 0,
        featuredReviews: 0,
      },
      thisMonth: { bookings: 0, revenue: 0 },
      lastMonth: { bookings: 0, revenue: 0 },
      recentBookings: [],
      recentReviews: [],
      monthlyBookings: [],
      monthlyRevenue: [],
      bookingsByRoom: [],
      statusBreakdown: [],
      newSignups: [],
    }, { status: 200 });
  }
}
