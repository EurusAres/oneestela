const mysql = require('mysql2/promise');

async function checkStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Checking office_rooms table structure...\n');
    
    const [columns] = await connection.execute('DESCRIBE office_rooms');
    console.table(columns);
    
    console.log('\nChecking if office_rooms has type column...');
    const hasType = columns.some(col => col.Field === 'type');
    
    if (hasType) {
      console.log('✅ office_rooms has type column');
      
      const [rooms] = await connection.execute('SELECT id, name, type FROM office_rooms');
      console.log('\nCurrent office rooms:');
      console.table(rooms);
    } else {
      console.log('❌ office_rooms does NOT have type column');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkStructure();
