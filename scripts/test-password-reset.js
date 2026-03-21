const mysql = require('mysql2/promise');

async function testPasswordReset() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'one_estela_place'
  });

  try {
    console.log('Testing password reset flow...\n');

    const testEmail = 'admin@oneestela.com';
    
    // Test 1: Check if user exists
    console.log('1. Checking if user exists...');
    const [users] = await connection.query(
      'SELECT id, first_name, last_name, email FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (users.length === 0) {
      console.log('❌ User not found with email:', testEmail);
      console.log('\nAvailable users:');
      const [allUsers] = await connection.query('SELECT id, email, first_name, last_name FROM users LIMIT 10');
      console.table(allUsers);
      return;
    }
    
    console.log('✓ User found:', users[0]);
    
    // Test 2: Check if verification_codes table exists
    console.log('\n2. Checking verification_codes table...');
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'verification_codes'"
    );
    
    if (tables.length === 0) {
      console.log('❌ verification_codes table does not exist');
      return;
    }
    
    console.log('✓ verification_codes table exists');
    
    // Test 3: Try to insert a verification code
    console.log('\n3. Testing verification code insertion...');
    const verificationCode = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await connection.query(
      `INSERT INTO verification_codes (email, code, expires_at, used, created_at)
       VALUES (?, ?, ?, FALSE, NOW())
       ON DUPLICATE KEY UPDATE code = ?, expires_at = ?, used = FALSE, created_at = NOW()`,
      [testEmail, verificationCode, expiresAt, verificationCode, expiresAt]
    );
    
    console.log('✓ Verification code inserted successfully');
    
    // Test 4: Verify the code was stored
    console.log('\n4. Verifying stored code...');
    const [codes] = await connection.query(
      'SELECT * FROM verification_codes WHERE email = ?',
      [testEmail]
    );
    
    console.log('Stored verification code:', codes[0]);
    
    console.log('\n✅ All tests passed! Password reset should work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

testPasswordReset();
