const mysql = require('mysql2/promise');

async function checkVenues() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Checking venues...\n');
    
    const [venues] = await connection.execute('SELECT id, name FROM venues ORDER BY id');
    
    if (venues.length === 0) {
      console.log('❌ No venues found');
    } else {
      console.log(`✅ Found ${venues.length} venues:`);
      console.table(venues);
    }
    
    console.log('\nChecking reviews table structure...');
    const [columns] = await connection.execute("DESCRIBE reviews");
    const hasVenueId = columns.some(col => col.Field === 'venue_id');
    
    if (hasVenueId) {
      console.log('✅ Reviews table has venue_id column');
    } else {
      console.log('❌ Reviews table does NOT have venue_id column');
      console.log('   Reviews can only be linked to office_rooms, not venues directly');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkVenues();
