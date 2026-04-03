// Test production database connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...\n');
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };

  console.log('Connection config:');
  console.log(`Host: ${config.host}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`Port: ${config.port}\n`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!\n');

    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Found ${rows[0].count} users in database`);

    const [venues] = await connection.execute('SELECT COUNT(*) as count FROM venues');
    console.log(`✅ Found ${venues[0].count} venues in database`);

    const [rooms] = await connection.execute('SELECT COUNT(*) as count FROM office_rooms');
    console.log(`✅ Found ${rooms[0].count} office rooms in database`);

    await connection.end();
    console.log('\n✅ All tests passed! Database is ready for production.');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
