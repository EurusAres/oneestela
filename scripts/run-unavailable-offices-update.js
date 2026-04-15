const mysql = require('mysql2/promise');

async function updateTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Connected to MySQL database');
    
    // Update table to make date columns optional
    await connection.execute(`
      ALTER TABLE unavailable_offices 
      MODIFY COLUMN start_date DATE NULL,
      MODIFY COLUMN end_date DATE NULL
    `);
    
    console.log('✅ Table updated successfully - date columns are now optional');
    
  } catch (error) {
    console.error('❌ Error updating table:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

updateTable();