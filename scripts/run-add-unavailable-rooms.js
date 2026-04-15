const mysql = require('mysql2/promise');

async function addColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Connected to MySQL database');
    
    // Add unavailable_rooms column
    await connection.execute(`
      ALTER TABLE unavailable_offices 
      ADD COLUMN unavailable_rooms INT NOT NULL DEFAULT 1 AFTER reason
    `);
    
    console.log('✅ Column added successfully - unavailable_rooms column added');
    
    // Verify the table structure
    const [rows] = await connection.execute('DESCRIBE unavailable_offices');
    console.log('Updated table structure:');
    console.table(rows);
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

addColumn();