const mysql = require('mysql2/promise');

async function checkOfficeRooms() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Connected to MySQL database');
    
    // Check if office_rooms table exists and has data
    const [rows] = await connection.execute('SELECT * FROM office_rooms LIMIT 10');
    console.log('Office rooms in database:');
    console.table(rows);
    
    if (rows.length === 0) {
      console.log('No office rooms found in database. You may need to add some office rooms first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking office rooms:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

checkOfficeRooms();