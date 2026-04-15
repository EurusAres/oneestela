const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Connected to MySQL database');
    
    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, 'create-unavailable-offices-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await connection.execute(sql);
    console.log('✅ Unavailable offices table created successfully');
    
    // Verify the table was created
    const [rows] = await connection.execute('DESCRIBE unavailable_offices');
    console.log('Table structure:');
    console.table(rows);
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

runMigration();