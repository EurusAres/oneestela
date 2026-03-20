const mysql = require('mysql2/promise');

async function testVenueReview() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Testing venue review submission...\n');
    
    // Get a test user
    const [users] = await connection.execute('SELECT id, full_name FROM users LIMIT 1');
    const testUser = users[0];
    console.log(`✅ Test user: ${testUser.full_name} (ID: ${testUser.id})`);
    
    // Get a test venue
    const [venues] = await connection.execute('SELECT id, name FROM venues LIMIT 1');
    const testVenue = venues[0];
    console.log(`✅ Test venue: ${testVenue.name} (ID: ${testVenue.id})`);
    
    // Insert a test review for the venue
    console.log('\nInserting test review for venue...');
    const [result] = await connection.execute(
      `INSERT INTO reviews 
       (user_id, office_room_id, venue_id, booking_id, rating, title, review_text, is_approved, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUser.id, null, testVenue.id, null, 5, 'Great Venue!', 'This venue was amazing for our event!', false, false]
    );
    
    console.log('✅ Review inserted successfully! ID:', result.insertId);
    
    // Fetch the review with JOIN to verify
    const [reviews] = await connection.execute(`
      SELECT r.*, 
             u.full_name, 
             o.name as room_name,
             v.name as venue_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN office_rooms o ON r.office_room_id = o.id
      LEFT JOIN venues v ON r.venue_id = v.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    console.log('\nFetched review:');
    console.table(reviews);
    
    // Clean up
    await connection.execute('DELETE FROM reviews WHERE id = ?', [result.insertId]);
    console.log('\n✅ Test review cleaned up');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

testVenueReview();
