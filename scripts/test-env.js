console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');

// Test the database connection with current env vars
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aiven') ? {
    rejectUnauthorized: false
  } : undefined
};

console.log('\nDatabase Config (without password):');
console.log({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? 'enabled' : 'disabled'
});

async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('\n✅ Database connection successful!');
    
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('Test query result:', result);
    
    await connection.end();
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
  }
}

testConnection();