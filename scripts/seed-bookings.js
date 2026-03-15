const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'one_estela_place';

async function seedBookings() {
  let connection;
  try {
    console.log('🔧 Connecting to database...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    console.log('✅ Connected to database');

    // Get user IDs
    const [users] = await connection.query('SELECT id, email FROM users WHERE role = "user"');
    
    if (users.length === 0) {
      console.log('❌ No users found. Please run setup-complete.js first.');
      return;
    }

    // Get office room IDs
    const [rooms] = await connection.query('SELECT id, name, price_per_hour FROM office_rooms');
    
    if (rooms.length === 0) {
      console.log('❌ No office rooms found. Please run setup-complete.js first.');
      return;
    }

    console.log(`\n📊 Found ${users.length} users and ${rooms.length} rooms`);

    // Clear existing bookings
    console.log('\n🗑️  Clearing existing bookings...');
    await connection.query('DELETE FROM bookings');

    // Create sample bookings
    const bookings = [
      // Confirmed bookings (past and upcoming)
      {
        user_id: users[0].id,
        office_room_id: rooms[0].id,
        check_in_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        check_out_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
        number_of_guests: 15,
        special_requests: 'Please arrange catering for 15 people',
        status: 'confirmed',
        total_price: 750.00
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        office_room_id: rooms[1] ? rooms[1].id : rooms[0].id,
        check_in_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        check_out_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
        number_of_guests: 50,
        special_requests: 'Need projector and sound system for presentation',
        status: 'confirmed',
        total_price: 600.00
      },
      {
        user_id: users[0].id,
        office_room_id: rooms[2] ? rooms[2].id : rooms[0].id,
        check_in_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        check_out_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
        number_of_guests: 8,
        special_requests: 'Small team meeting, need whiteboard',
        status: 'confirmed',
        total_price: 150.00
      },
      // Pending bookings (need admin approval)
      {
        user_id: users[1] ? users[1].id : users[0].id,
        office_room_id: rooms[3] ? rooms[3].id : rooms[0].id,
        check_in_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        check_out_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
        number_of_guests: 10,
        special_requests: 'Birthday celebration, need decorations allowed',
        status: 'pending',
        total_price: 255.00
      },
      {
        user_id: users[0].id,
        office_room_id: rooms[1] ? rooms[1].id : rooms[0].id,
        check_in_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        check_out_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // +5 hours
        number_of_guests: 80,
        special_requests: 'Corporate training session, need WiFi for all attendees',
        status: 'pending',
        total_price: 750.00
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        office_room_id: rooms[0].id,
        check_in_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        check_out_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
        number_of_guests: 20,
        special_requests: 'Executive board meeting, need coffee service',
        status: 'pending',
        total_price: 1000.00
      },
      // Completed bookings (past)
      {
        user_id: users[0].id,
        office_room_id: rooms[2] ? rooms[2].id : rooms[0].id,
        check_in_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        check_out_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
        number_of_guests: 6,
        special_requests: 'Team planning session',
        status: 'completed',
        total_price: 225.00
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        office_room_id: rooms[1] ? rooms[1].id : rooms[0].id,
        check_in_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        check_out_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // +6 hours
        number_of_guests: 75,
        special_requests: 'Product launch event',
        status: 'completed',
        total_price: 900.00
      },
      // Cancelled booking
      {
        user_id: users[0].id,
        office_room_id: rooms[3] ? rooms[3].id : rooms[0].id,
        check_in_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        check_out_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
        number_of_guests: 12,
        special_requests: 'Client meeting - cancelled due to schedule conflict',
        status: 'cancelled',
        total_price: 170.00
      }
    ];

    console.log('\n📝 Creating sample bookings...');
    
    for (const booking of bookings) {
      await connection.query(
        `INSERT INTO bookings 
         (user_id, office_room_id, check_in_date, check_out_date, number_of_guests, special_requests, status, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.user_id,
          booking.office_room_id,
          booking.check_in_date,
          booking.check_out_date,
          booking.number_of_guests,
          booking.special_requests,
          booking.status,
          booking.total_price
        ]
      );
    }

    console.log(`✅ Created ${bookings.length} sample bookings`);

    // Show summary
    const [summary] = await connection.query(`
      SELECT status, COUNT(*) as count, SUM(total_price) as total_revenue
      FROM bookings
      GROUP BY status
    `);

    console.log('\n📊 Booking Summary:');
    console.log('─────────────────────────────────────');
    summary.forEach(row => {
      console.log(`${row.status.padEnd(15)} ${String(row.count).padStart(3)} bookings   ₱${Number(row.total_revenue).toLocaleString()}`);
    });

    const [[totals]] = await connection.query(`
      SELECT COUNT(*) as total, SUM(total_price) as revenue
      FROM bookings
    `);

    console.log('─────────────────────────────────────');
    console.log(`${'TOTAL'.padEnd(15)} ${String(totals.total).padStart(3)} bookings   ₱${Number(totals.revenue).toLocaleString()}`);
    console.log('─────────────────────────────────────');

    console.log('\n✨ Sample bookings created successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Login as admin: admin@oneestela.com / admin123');
    console.log('3. View the dashboard to see booking statistics');
    console.log('4. Go to Bookings page to manage pending requests');

  } catch (error) {
    console.error('\n❌ Error seeding bookings:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedBookings();
