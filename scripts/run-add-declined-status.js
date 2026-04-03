const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'add-declined-status.sql'),
      'utf8'
    );

    await connection.execute(sql);
    console.log('✓ Successfully added "declined" to status ENUM');

    // Verify the change
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM bookings WHERE Field = 'status'"
    );
    console.log('\nUpdated status column:');
    console.log(columns[0]);

    // Now update the bookings that should be declined
    await connection.execute(
      'UPDATE bookings SET status = "declined" WHERE decline_reason IS NOT NULL AND decline_reason != ""'
    );
    console.log('\n✓ Updated bookings with decline reasons to "declined" status');

    // Show the updated bookings
    const [bookings] = await connection.execute(
      'SELECT id, event_name, status, decline_reason FROM bookings WHERE status = "declined"'
    );
    console.log('\nDeclined bookings:');
    console.log(bookings);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
