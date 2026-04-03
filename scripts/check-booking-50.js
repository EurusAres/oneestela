const mysql = require('mysql2/promise');

async function checkBooking() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    // Check booking 50 specifically
    const [bookings] = await connection.execute(
      'SELECT id, event_name, status, decline_reason, special_requests FROM bookings WHERE id = 50'
    );
    
    console.log('Booking 50 details:');
    console.log(JSON.stringify(bookings, null, 2));

    // Check all recent bookings
    const [allBookings] = await connection.execute(
      'SELECT id, event_name, status, decline_reason FROM bookings ORDER BY id DESC LIMIT 5'
    );
    
    console.log('\nRecent bookings:');
    console.log(JSON.stringify(allBookings, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkBooking();
