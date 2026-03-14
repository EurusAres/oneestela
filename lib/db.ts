import mysql from 'mysql2/promise';

// Create a connection pool for better performance
let pool: mysql.Pool | null = null;

export async function getPool(): Promise<mysql.Pool> {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'estela_place',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export async function executeQuery(query: string, values: any[] = []) {
  const pool = await getPool();
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function executeQueryWithConnection(
  query: string,
  values: any[] = []
): Promise<any> {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const [results] = await connection.execute(query, values);
    return results;
  } finally {
    connection.release();
  }
}

// Close the pool (useful for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
