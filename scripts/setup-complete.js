const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'estela_place';

async function setupDatabase() {
  let connection;
  try {
    console.log('🔧 Connecting to MySQL server...');
    
    // First connection to create database
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute schema file
    console.log('\n📋 Creating database schema...');
    const schemaFile = path.join(__dirname, 'init-database.sql');
    const schema = fs.readFileSync(schemaFile, 'utf8');
    
    await connection.query(schema);
    console.log('✅ Database schema created successfully');

    // Close and reconnect to the specific database
    await connection.end();

    // Connect to the specific database
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true
    });

    // Read and execute seed data file
    console.log('\n🌱 Seeding database with initial data...');
    const seedFile = path.join(__dirname, 'seed-data.sql');
    const seedData = fs.readFileSync(seedFile, 'utf8');
    
    await connection.query(seedData);
    console.log('✅ Database seeded with initial data');

    console.log('\n✨ Database setup completed successfully!');
    console.log(`\n📊 Database: ${DB_NAME}`);
    console.log(`🖥️  Host: ${DB_HOST}`);
    console.log(`👤 User: ${DB_USER}`);
    console.log('\n🚀 Your application is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Update your .env.local file with your database credentials');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3000');

  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
