const mysql = require('mysql2/promise');

async function updateVenueImage() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    // Update the first venue with an existing uploaded image
    await connection.execute(
      'UPDATE venues SET image_url = ? WHERE id = 2',
      ['/uploads/venues/venue-regular-1773724821001-9te9ytih82e.jpg']
    );

    console.log('Updated venue ID 2 with test image');

    // Verify the update
    const [rows] = await connection.execute(
      'SELECT id, name, image_url FROM venues WHERE id = 2'
    );
    console.log('Verification:', rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updateVenueImage();
