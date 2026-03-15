import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'one_estela_place',
});

const [dbs] = await connection.query('SELECT DATABASE() as db');
console.log('Connected to:', dbs[0].db);

const [venues] = await connection.query('SELECT * FROM venues');
console.log('Venues:', venues);

const [rooms] = await connection.query('SELECT * FROM office_rooms');
console.log('Office rooms:', rooms);

const [users] = await connection.query('SELECT id, email, role FROM users');
console.log('Users:', users);

await connection.end();
