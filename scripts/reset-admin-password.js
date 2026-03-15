import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const newPassword = 'admin123';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'estela_place',
});

const hash = await bcrypt.hash(newPassword, 10);

await connection.execute(
  'UPDATE users SET password_hash = ? WHERE email = ?',
  [hash, 'admin@oneestela.com']
);

console.log('✓ Password updated for admin@oneestela.com');
await connection.end();
