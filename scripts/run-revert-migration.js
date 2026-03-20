const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function revertMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place',
    multipleStatements: true
  });

  try {
    console.log('Reverting image columns back to VARCHAR...');
    
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'revert-images-to-varchar.sql'),
      'utf8'
    );

    await connection.query(sqlFile);

    console.log('✓ Revert completed successfully!');
    console.log('✓ Image columns are now VARCHAR(500) type');
    console.log('✓ Images will be stored as file paths');
  } catch (error) {
    console.error('Revert failed:', error);
  } finally {
    await connection.end();
  }
}

revertMigration();
