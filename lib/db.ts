import mysql from 'mysql2/promise'

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

// Aiven MySQL configuration with SSL support
const dbConfig = {
  host: process.env.DB_HOST || (isProduction ? 'one-estela-place-eares223321-3924.i.aivencloud.com' : '127.0.0.1'),
  port: parseInt(process.env.DB_PORT || (isProduction ? '22797' : '3306')),
  user: process.env.DB_USER || (isProduction ? 'avnadmin' : 'root'),
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'one_estela_place',
  ssl: isProduction ? {
    rejectUnauthorized: false // Required for Aiven managed MySQL
  } : undefined,
  connectTimeout: 60000,
  // Connection pool settings for better performance
  connectionLimit: 10,
  queueLimit: 0
}

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig)

export async function getConnection() {
  try {
    // Skip database connection during build time if no credentials are available
    if (!dbConfig.host || (!dbConfig.password && isProduction)) {
      console.log('Skipping database connection during build time')
      throw new Error('Database connection skipped during build')
    }
    
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error('Aiven database connection error:', error)
    throw error
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const connection = await getConnection()
    try {
      const [results] = await connection.execute(query, params)
      return results
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Query execution error:', error)
    // Return empty array for build-time queries to prevent build failures
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      console.log('Returning empty result for build-time query')
      return []
    }
    throw error
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
