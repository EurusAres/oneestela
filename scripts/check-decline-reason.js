const mysql = require('mysql2/promise');

async function checkDeclineReason() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    // Check if decline_reason column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM bookings LIKE 'decline_reason'"
    );
    
    console.log('Column exists:', columns.length > 0);
    if (columns.length > 0) {
      console.log('Column details:', columns[0]);
    }

    // Check bookings with decline_reason
    const [bookings] = await connection.execute(
      'SELECT id, event_name, status, decline_reason FROM bookings WHERE status = "declined"'
    );
    
    console.log('\nDeclined bookings:');
    console.log(bookings);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkDeclineReason();
