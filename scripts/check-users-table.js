const mysql = require('mysql2/promise');

async function checkUsersTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Checking users table structure...\n');
    
    const [columns] = await connection.query('DESCRIBE users');
    console.log('Users table columns:');
    console.table(columns);
    
    console.log('\nSample user data:');
    const [users] = await connection.query('SELECT * FROM users LIMIT 3');
    console.table(users);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUsersTable();
