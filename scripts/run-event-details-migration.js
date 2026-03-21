const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place',
    multipleStatements: true
  });

  try {
    console.log('Connected to database');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'add-event-details-to-bookings.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Running migration...');
    await connection.query(sql);

    console.log('✓ Migration completed successfully!');
    console.log('✓ Added event_name and event_type columns to bookings table');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
