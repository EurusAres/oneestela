const mysql = require('mysql2/promise');

async function fixBookingStatus() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    // Update bookings 49 and 50 to have declined status
    await connection.execute(
      'UPDATE bookings SET status = "declined" WHERE id IN (49, 50) AND decline_reason IS NOT NULL'
    );
    
    console.log('Updated bookings 49 and 50 to declined status');

    // Verify the update
    const [bookings] = await connection.execute(
      'SELECT id, event_name, status, decline_reason FROM bookings WHERE id IN (49, 50)'
    );
    
    console.log('\nUpdated bookings:');
    console.log(JSON.stringify(bookings, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixBookingStatus();
