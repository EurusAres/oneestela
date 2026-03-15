const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'one_estela_place';

async function seedAdditionalData() {
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

    // Get users and bookings
    const [users] = await connection.query('SELECT id FROM users WHERE role = "user"');
    const [rooms] = await connection.query('SELECT id FROM office_rooms');
    const [bookings] = await connection.query('SELECT id, user_id, office_room_id FROM bookings WHERE status = "completed" LIMIT 5');

    // Add reviews
    console.log('\n📝 Adding customer reviews...');
    const reviews = [
      {
        user_id: users[0].id,
        office_room_id: rooms[0].id,
        booking_id: bookings[0] ? bookings[0].id : null,
        rating: 5,
        title: 'Excellent Venue!',
        review_text: 'The Executive Suite exceeded our expectations. Perfect for our board meeting with stunning views and top-notch facilities.',
        is_approved: true
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        office_room_id: rooms[1] ? rooms[1].id : rooms[0].id,
        booking_id: bookings[1] ? bookings[1].id : null,
        rating: 5,
        title: 'Perfect for Large Events',
        review_text: 'Conference Hall was ideal for our product launch. Great audio system and the staff was incredibly helpful.',
        is_approved: true
      },
      {
        user_id: users[0].id,
        office_room_id: rooms[2] ? rooms[2].id : rooms[0].id,
        booking_id: bookings[2] ? bookings[2].id : null,
        rating: 4,
        title: 'Great Meeting Space',
        review_text: 'Meeting Room A was perfect for our team session. Clean, well-equipped, and good WiFi. Only minor issue was parking.',
        is_approved: true
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        office_room_id: rooms[0].id,
        booking_id: null,
        rating: 5,
        title: 'Highly Recommended',
        review_text: 'Professional service, beautiful venue, and excellent amenities. Will definitely book again for future events.',
        is_approved: true
      }
    ];

    for (const review of reviews) {
      await connection.query(
        `INSERT INTO reviews (user_id, office_room_id, booking_id, rating, title, review_text, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [review.user_id, review.office_room_id, review.booking_id, review.rating, review.title, review.review_text, review.is_approved]
      );
    }

    console.log(`✅ Added ${reviews.length} customer reviews`);

    // Add contact messages
    console.log('\n📧 Adding contact messages...');
    const messages = [
      {
        user_id: users[0].id,
        name: 'John Doe',
        email: 'user@example.com',
        subject: 'Question about Corporate Packages',
        message: 'Hi, I would like to know if you offer special rates for corporate clients who book regularly. We have monthly meetings and would love to partner with you.',
        status: 'unread'
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        name: 'Jane Smith',
        email: 'client2@example.com',
        subject: 'Catering Services Inquiry',
        message: 'Do you provide in-house catering services? We are planning a full-day workshop for 50 people and need breakfast, lunch, and snacks.',
        status: 'unread'
      },
      {
        user_id: null,
        name: 'Michael Brown',
        email: 'michael.brown@company.com',
        subject: 'Wedding Reception Venue',
        message: 'I am interested in booking your venue for a wedding reception in June. Can you provide information about capacity, pricing, and available dates?',
        status: 'unread'
      },
      {
        user_id: null,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        subject: 'Thank You!',
        message: 'Just wanted to say thank you for the wonderful experience at our event last week. Everything was perfect and your team was amazing!',
        status: 'read'
      },
      {
        user_id: users[0].id,
        name: 'John Doe',
        email: 'user@example.com',
        subject: 'Equipment Rental',
        message: 'Do you rent out additional equipment like microphones, speakers, or video cameras? We might need these for our upcoming presentation.',
        status: 'replied'
      }
    ];

    for (const msg of messages) {
      await connection.query(
        `INSERT INTO contact_messages (user_id, name, email, subject, message, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [msg.user_id, msg.name, msg.email, msg.subject, msg.message, msg.status]
      );
    }

    console.log(`✅ Added ${messages.length} contact messages`);

    // Add staff members
    console.log('\n👥 Adding staff members...');
    const staff = [
      {
        user_id: users[0].id,
        position: 'Event Coordinator',
        department: 'Operations',
        hire_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        salary: 45000.00,
        status: 'active'
      },
      {
        user_id: users[1] ? users[1].id : users[0].id,
        position: 'Facilities Manager',
        department: 'Maintenance',
        hire_date: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), // 2 years ago
        salary: 55000.00,
        status: 'active'
      }
    ];

    for (const member of staff) {
      await connection.query(
        `INSERT INTO staff (user_id, position, department, hire_date, salary, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE position = VALUES(position)`,
        [member.user_id, member.position, member.department, member.hire_date, member.salary, member.status]
      );
    }

    console.log(`✅ Added ${staff.length} staff members`);

    // Show final summary
    console.log('\n📊 Database Summary:');
    console.log('─────────────────────────────────────');
    
    const [[bookingCount]] = await connection.query('SELECT COUNT(*) as count FROM bookings');
    console.log(`Bookings:         ${bookingCount.count}`);
    
    const [[reviewCount]] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`Reviews:          ${reviewCount.count}`);
    
    const [[messageCount]] = await connection.query('SELECT COUNT(*) as count FROM contact_messages');
    console.log(`Messages:         ${messageCount.count}`);
    
    const [[staffCount]] = await connection.query('SELECT COUNT(*) as count FROM staff');
    console.log(`Staff:            ${staffCount.count}`);
    
    const [[userCount]] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users:            ${userCount.count}`);
    
    const [[roomCount]] = await connection.query('SELECT COUNT(*) as count FROM office_rooms');
    console.log(`Office Rooms:     ${roomCount.count}`);
    
    console.log('─────────────────────────────────────');

    console.log('\n✨ Additional data seeded successfully!');
    console.log('\n🎉 Your admin dashboard is now fully functional with:');
    console.log('   • Customer bookings (pending, confirmed, completed)');
    console.log('   • Customer reviews and ratings');
    console.log('   • Contact messages and inquiries');
    console.log('   • Staff information');
    console.log('   • Revenue statistics');
    console.log('\n🚀 Login as admin to see everything in action!');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedAdditionalData();
