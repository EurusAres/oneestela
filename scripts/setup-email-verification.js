const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupEmailVerification() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'one_estela_place',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log('Connected to database');

    // Read and execute SQL file
    const sqlFile = path.join(__dirname, 'create-email-verification-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await connection.query(sql);
    console.log('✓ Email verification table created successfully');

    console.log('\n✓ Email verification setup complete!');
  } catch (error) {
    console.error('Error setting up email verification:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupEmailVerification();
