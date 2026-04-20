const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash validation:', isValid);
    
    console.log('\nSQL to update users:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@oneestela.com';`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'estelatest1@gmail.com';`);
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePasswordHash();