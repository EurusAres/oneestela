const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Empty password as specified
    database: 'one_estela_place'
  });

  try {
    console.log('Connected to database');
    
    // Read and execute the SQL migration
    const sqlPath = path.join(__dirname, 'add-available-rooms-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await connection.execute(statement);
      }
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the column was added
    const [rows] = await connection.execute('DESCRIBE office_rooms');
    console.log('\nCurrent table structure:');
    console.table(rows);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

runMigration();