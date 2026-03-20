const mysql = require('mysql2/promise');

async function testReviewSubmission() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Testing review submission...\n');
    
    // Get a test user
    const [users] = await connection.execute('SELECT id, full_name FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.full_name} (ID: ${testUser.id})`);
    
    // Get a test office room
    const [rooms] = await connection.execute('SELECT id, name FROM office_rooms LIMIT 1');
    if (rooms.length === 0) {
      console.log('❌ No office rooms found in database');
      return;
    }
    const testRoom = rooms[0];
    console.log(`✅ Found test room: ${testRoom.name} (ID: ${testRoom.id})`);
    
    // Try to insert a test review
    console.log('\nAttempting to insert test review...');
    const testData = {
      userId: testUser.id,
      officeRoomId: testRoom.id,
      bookingId: null,
      rating: 5,
      title: 'Test Review',
      reviewText: 'This is a test review'
    };
    
    console.log('Review data:', testData);
    
    const [result] = await connection.execute(
      `INSERT INTO reviews 
       (user_id, office_room_id, booking_id, rating, title, review_text, is_approved, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testData.userId, testData.officeRoomId, testData.bookingId, testData.rating, testData.title, testData.reviewText, false, false]
    );
    
    console.log('\n✅ Review inserted successfully!');
    console.log('Insert ID:', result.insertId);
    
    // Verify the review was inserted
    const [reviews] = await connection.execute('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    console.log('\nInserted review:');
    console.table(reviews);
    
    // Clean up - delete the test review
    await connection.execute('DELETE FROM reviews WHERE id = ?', [result.insertId]);
    console.log('\n✅ Test review cleaned up');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

testReviewSubmission();
