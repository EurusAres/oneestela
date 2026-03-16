const mysql = require('mysql2/promise');

async function checkBookings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    const [bookings] = await connection.execute(
      'SELECT * FROM bookings WHERE status IN (?, ?)',
      ['confirmed', 'pending']
    );
    
    console.log('Reserved Bookings (Confirmed/Pending):');
    console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkBookings();
