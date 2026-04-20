import mysql from 'mysql2/promise'

// Aiven MySQL configuration with SSL support
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '22321'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'one_estela_place',
  ssl: {
    rejectUnauthorized: false // Required for Aiven managed MySQL
  },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  // Connection pool settings for better performance
  connectionLimit: 10,
  queueLimit: 0
}

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig)

export async function getConnection() {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error('Aiven database connection error:', error)
    throw error
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = await getConnection()
  try {
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error('Query execution error:', error)
    throw error
  } finally {
    connection.release()
  }
}

// Legacy functions for compatibility
export async function getPool() {
  return pool
}

export async function executeQueryWithConnection(query: string, values: any[] = []) {
  return executeQuery(query, values)
}

export async function closePool() {
  await pool.end()
}

export default pool
