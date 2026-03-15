const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  console.log('Checking payment_proofs table...');

  const [cols] = await conn.execute('DESCRIBE payment_proofs');
  console.log('Columns:');
  cols.forEach(c => console.log(`  ${c.Field} - ${c.Type}`));

  await conn.end();
}

run().catch(console.error);
