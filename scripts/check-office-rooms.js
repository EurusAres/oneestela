const mysql = require('mysql2/promise');

async function checkOfficeRooms() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Checking office rooms...\n');
    
    const [rooms] = await connection.execute('SELECT id, name FROM office_rooms ORDER BY id');
    
    if (rooms.length === 0) {
      console.log('❌ No office rooms found');
    } else {
      console.log(`✅ Found ${rooms.length} office rooms:`);
      console.table(rooms);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkOfficeRooms();
