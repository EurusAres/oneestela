const mysql = require('mysql2/promise');

async function checkBookingOrder() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    // Check pending bookings with their submission dates
    const [bookings] = await connection.execute(
      'SELECT id, event_name, status, created_at FROM bookings WHERE status = "pending" ORDER BY created_at ASC'
    );
    
    console.log('Pending bookings (oldest to newest):');
    bookings.forEach((b, index) => {
      console.log(`${index + 1}. ID: ${b.id}, Event: ${b.event_name}, Created: ${b.created_at}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkBookingOrder();
