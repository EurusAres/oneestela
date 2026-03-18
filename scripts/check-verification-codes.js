const mysql = require('mysql2/promise');

async function checkCodes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT email, code, LENGTH(code) as code_length, HEX(code) as code_hex, expires_at, verified FROM email_verifications ORDER BY created_at DESC LIMIT 5'
    );

    console.log('Recent verification codes:');
    console.log('='.repeat(80));
    rows.forEach((row, index) => {
      console.log(`\n[${index + 1}] Email: ${row.email}`);
      console.log(`    Code: "${row.code}"`);
      console.log(`    Length: ${row.code_length}`);
      console.log(`    Hex: ${row.code_hex}`);
      console.log(`    Expires: ${row.expires_at}`);
      console.log(`    Verified: ${row.verified}`);
    });
    console.log('\n' + '='.repeat(80));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkCodes();
