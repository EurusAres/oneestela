const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  console.log('Creating payment_proofs table...');

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS payment_proofs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      file_id VARCHAR(255) NOT NULL,
      file_name VARCHAR(500) NOT NULL,
      file_url TEXT NOT NULL,
      file_size INT NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      payment_method VARCHAR(100) NOT NULL,
      payment_amount VARCHAR(50) NOT NULL,
      payment_date DATE NOT NULL,
      payment_reference VARCHAR(255),
      status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      verified_at TIMESTAMP NULL,
      verified_by INT NULL,
      admin_note TEXT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      INDEX idx_booking (booking_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('✓ payment_proofs table created successfully');

  await conn.end();
}

run().catch(console.error);
