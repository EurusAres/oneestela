const mysql = require('mysql2/promise');

async function checkImages() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('\n=== VENUES ===');
    const [venues] = await connection.execute(
      'SELECT id, name, image_url FROM venues ORDER BY id DESC LIMIT 5'
    );
    venues.forEach((venue) => {
      console.log(`\n[${venue.id}] ${venue.name}`);
      console.log(`    Image URL: "${venue.image_url}"`);
      console.log(`    URL Length: ${venue.image_url ? venue.image_url.length : 0}`);
    });

    console.log('\n\n=== OFFICE ROOMS ===');
    const [rooms] = await connection.execute(
      'SELECT id, name, image_url FROM office_rooms ORDER BY id DESC LIMIT 5'
    );
    rooms.forEach((room) => {
      console.log(`\n[${room.id}] ${room.name}`);
      console.log(`    Image URL: "${room.image_url}"`);
      console.log(`    URL Length: ${room.image_url ? room.image_url.length : 0}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkImages();
