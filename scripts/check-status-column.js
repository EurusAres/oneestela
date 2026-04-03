const mysql = require('mysql2/promise');

async function checkStatusColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    // Check status column definition
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM bookings WHERE Field = 'status'"
    );
    
    console.log('Status column definition:');
    console.log(JSON.stringify(columns, null, 2));

    // Try direct update with explicit value
    await connection.execute(
      "UPDATE bookings SET status = 'declined' WHERE id = 50"
    );
    
    console.log('\nAttempted to update booking 50...');

    // Check the result
    const [result] = await connection.execute(
      'SELECT id, status, LENGTH(status) as status_length FROM bookings WHERE id = 50'
    );
    
    console.log('\nBooking 50 after update:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkStatusColumn();
