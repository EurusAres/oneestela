const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'one_estela_place',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Adding decline_reason column to bookings table...');
    
    await connection.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS decline_reason TEXT NULL AFTER special_requests
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('decline_reason column added to bookings table.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
