const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  console.log('Updating payment_proofs table to support large files...');

  // Modify file_url column to LONGTEXT to support large base64 data
  await conn.execute(`
    ALTER TABLE payment_proofs 
    MODIFY COLUMN file_url LONGTEXT NOT NULL
  `);

  console.log('✓ payment_proofs table updated successfully');

  await conn.end();
}

run().catch(console.error);
