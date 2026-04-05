const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Creating unavailable_dates table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS unavailable_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT NOT NULL,
        date DATE NOT NULL,
        reason ENUM('Maintenance', 'Staffing Shortages') NOT NULL,
        notes TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
        UNIQUE KEY unique_venue_date (venue_id, date)
      );
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ unavailable_dates table created successfully');
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();