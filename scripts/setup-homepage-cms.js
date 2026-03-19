const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupHomepageCMS() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'one_estela_place'
  });

  try {
    console.log('Creating homepage_content table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hero_title VARCHAR(255),
        hero_description TEXT,
        hero_image VARCHAR(500),
        about_title VARCHAR(255),
        about_description TEXT,
        cta_title VARCHAR(255),
        cta_description TEXT,
        cta_button_text VARCHAR(100),
        features JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Table created successfully!');

    // Check if data exists
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM homepage_content');
    
    if (rows[0].count === 0) {
      console.log('Inserting default homepage content...');
      
      await connection.execute(`
        INSERT INTO homepage_content (
          hero_title,
          hero_description,
          hero_image,
          about_title,
          about_description,
          cta_title,
          cta_description,
          cta_button_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Welcome to One Estela Place',
        'The premier event and office space in the heart of the city',
        '',
        'About Us',
        'One Estela Place offers premium event venues and modern office spaces designed for your success.',
        'Ready to Book?',
        'Contact us today to reserve your space',
        'Get Started'
      ]);

      console.log('Default content inserted successfully!');
    } else {
      console.log('Homepage content already exists.');
    }

    console.log('\n✅ Homepage CMS setup complete!');
    
  } catch (error) {
    console.error('Error setting up homepage CMS:', error);
  } finally {
    await connection.end();
  }
}

setupHomepageCMS();
