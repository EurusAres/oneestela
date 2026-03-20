const mysql = require('mysql2/promise');

async function checkReviewsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Checking reviews table...\n');
    
    // Check if table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'reviews'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Reviews table does NOT exist!');
      console.log('\nCreating reviews table...');
      
      await connection.execute(`
        CREATE TABLE reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          office_room_id INT NOT NULL,
          booking_id INT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(100) DEFAULT '',
          review_text TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT FALSE,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
        )
      `);
      
      console.log('✅ Reviews table created successfully!');
    } else {
      console.log('✅ Reviews table exists');
      
      // Show table structure
      const [columns] = await connection.execute('DESCRIBE reviews');
      console.log('\nTable structure:');
      console.table(columns);
      
      // Count reviews
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM reviews');
      console.log(`\nTotal reviews: ${count[0].count}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkReviewsTable();
