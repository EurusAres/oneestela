// Test Aiven MySQL connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAivenConnection() {
  console.log('🔍 Testing Aiven MySQL connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '22321'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    ssl: {
      rejectUnauthorized: false // Required for Aiven
    },
    connectTimeout: 60000
  };

  try {
    console.log('\n⏳ Connecting to Aiven MySQL...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Connected successfully!');
    
    // Test basic query
    console.log('\n🔍 Testing basic query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    // Check if our database exists
    console.log('\n🔍 Checking database...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 Available databases:', databases.map(db => db.Database));
    
    // Check if we can create tables (test permissions)
    console.log('\n🔍 Testing table creation permissions...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id INT PRIMARY KEY AUTO_INCREMENT,
        test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table creation successful!');
    
    // Clean up test table
    await connection.execute('DROP TABLE IF EXISTS connection_test');
    console.log('✅ Cleanup successful!');
    
    await connection.end();
    console.log('\n🎉 Aiven connection test completed successfully!');
    console.log('✅ Your database is ready for deployment.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Ensure your Aiven database is powered ON');
    console.error('2. Check your connection details in .env file');
    console.error('3. Verify your password is correct');
    console.error('4. Make sure SSL is enabled (Aiven requires it)');
    process.exit(1);
  }
}

testAivenConnection();