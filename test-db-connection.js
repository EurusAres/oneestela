const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'one_estela_place',
    });

    console.log('✓ Connected to database successfully');

    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('✓ Query executed successfully');
    console.log('Users count:', rows[0].count);

    // Test staff table
    const [staffRows] = await connection.execute('SELECT COUNT(*) as count FROM staff');
    console.log('✓ Staff table accessible');
    console.log('Staff count:', staffRows[0].count);

    await connection.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
