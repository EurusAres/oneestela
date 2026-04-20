import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('DB_HOST:', process.env.DB_HOST)
    console.log('DB_USER:', process.env.DB_USER)
    console.log('DB_NAME:', process.env.DB_NAME)
    console.log('DB_PORT:', process.env.DB_PORT)
    console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD)
    
    // Test basic connection
    const result = await executeQuery('SELECT 1 as test')
    
    // Test users table
    const userCount = await executeQuery('SELECT COUNT(*) as count FROM users')
    
    // Get actual users (without passwords)
    const users = await executeQuery('SELECT id, email, full_name, role FROM users')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testQuery: result,
      userCount: userCount,
      users: users,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        hasPassword: !!process.env.DB_PASSWORD
      }
    })
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      errno: error.errno,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        hasPassword: !!process.env.DB_PASSWORD
      }
    }, { status: 500 })
  }
}