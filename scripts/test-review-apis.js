const mysql = require('mysql2/promise');

async function testReviewAPIs() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  console.log('=== Testing Review APIs ===\n');

  // Test 1: Check venues
  console.log('1. Checking venues table:');
  const [venues] = await conn.query('SELECT id, name FROM venues');
  console.log('Venues:', venues);
  console.log('');

  // Test 2: Check office_rooms
  console.log('2. Checking office_rooms table:');
  const [rooms] = await conn.query('SELECT id, name FROM office_rooms');
  console.log('Office Rooms:', rooms);
  console.log('');

  // Test 3: Check reviews table structure
  console.log('3. Checking reviews table structure:');
  const [columns] = await conn.query('DESCRIBE reviews');
  console.log('Reviews table columns:');
  columns.forEach(col => {
    console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
  });
  console.log('');

  // Test 4: Check if reviews table exists and has data
  console.log('4. Checking existing reviews:');
  const [reviews] = await conn.query('SELECT * FROM reviews LIMIT 5');
  console.log('Sample reviews:', reviews);
  console.log('');

  await conn.end();
  console.log('=== Test Complete ===');
}

testReviewAPIs().catch(console.error);
