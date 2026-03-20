const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place',
    multipleStatements: true
  });

  try {
    console.log('Running migration to add venue_id to reviews table...\n');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'add-venue-to-reviews.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the migration
    await connection.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nReviews table now supports both office_rooms and venues');
    
    // Verify the changes
    const [columns] = await connection.execute('DESCRIBE reviews');
    console.log('\nUpdated reviews table structure:');
    console.table(columns);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
