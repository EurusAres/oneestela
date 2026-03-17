// Test script to check database schema
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseSchema() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'one_estela_place'
    });

    console.log('✓ Connected to database');

    // Check venues table structure
    console.log('\n--- VENUES TABLE STRUCTURE ---');
    const [venuesColumns] = await connection.query('DESCRIBE venues');
    console.log('Columns:', venuesColumns.map(col => col.Field).join(', '));
    
    const hasVenue360 = venuesColumns.some(col => col.Field === 'image_360_url');
    console.log('Has image_360_url:', hasVenue360 ? '✓ YES' : '✗ NO - NEEDS MIGRATION');

    // Check office_rooms table structure
    console.log('\n--- OFFICE_ROOMS TABLE STRUCTURE ---');
    const [roomsColumns] = await connection.query('DESCRIBE office_rooms');
    console.log('Columns:', roomsColumns.map(col => col.Field).join(', '));
    
    const hasRoom360 = roomsColumns.some(col => col.Field === 'image_360_url');
    const hasType = roomsColumns.some(col => col.Field === 'type');
    console.log('Has image_360_url:', hasRoom360 ? '✓ YES' : '✗ NO - NEEDS MIGRATION');
    console.log('Has type:', hasType ? '✓ YES' : '✗ NO - NEEDS MIGRATION');

    // Test query
    console.log('\n--- TEST QUERIES ---');
    const [venues] = await connection.query('SELECT COUNT(*) as count FROM venues');
    console.log('Venues count:', venues[0].count);

    const [rooms] = await connection.query('SELECT COUNT(*) as count FROM office_rooms');
    console.log('Office rooms count:', rooms[0].count);

    console.log('\n✓ All tests passed!');

    if (!hasVenue360 || !hasRoom360 || !hasType) {
      console.log('\n⚠ WARNING: Missing columns detected!');
      console.log('Please run the following SQL commands:\n');
      
      if (!hasVenue360) {
        console.log('ALTER TABLE venues ADD COLUMN image_360_url VARCHAR(500) DEFAULT \'\';');
      }
      if (!hasRoom360) {
        console.log('ALTER TABLE office_rooms ADD COLUMN image_360_url VARCHAR(500) DEFAULT \'\';');
      }
      if (!hasType) {
        console.log('ALTER TABLE office_rooms ADD COLUMN type VARCHAR(50) DEFAULT \'office\';');
      }
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database is running');
    console.error('2. .env file has correct credentials');
    console.error('3. Database "one_estela_place" exists');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabaseSchema();
