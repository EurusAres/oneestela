const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function updateStaffPassword() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'one_estela_place',
    });

    console.log('✓ Connected to database');

    // Hash the password
    const hashedPassword = await bcrypt.hash('staff123', 10);
    console.log('✓ Password hashed');

    // Update all staff users with the new hashed password
    const [result] = await connection.execute(
      `UPDATE users 
       SET password_hash = ? 
       WHERE role = 'staff'`,
      [hashedPassword]
    );

    console.log('✓ Updated staff passwords');
    console.log('Rows affected:', result.affectedRows);

    // Show all staff users
    const [staffUsers] = await connection.execute(
      `SELECT id, email, full_name, role FROM users WHERE role = 'staff'`
    );

    console.log('\nStaff users:');
    staffUsers.forEach(user => {
      console.log(`- ${user.full_name} (${user.email})`);
    });

    await connection.end();
    console.log('\n✓ Done! All staff members can now log in with password: staff123');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

updateStaffPassword();
