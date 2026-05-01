import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET', 
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
      DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    })

    // Test basic connection
    const result = await executeQuery('SELECT 1 as test')
    console.log('Database connection successful:', result)

    // Test bookings table exists
    const tableCheck = await executeQuery('SHOW TABLES LIKE ?', ['bookings'])
    console.log('Bookings table check:', tableCheck)

    // Test bookings count
    const bookingsCount = await executeQuery('SELECT COUNT(*) as count FROM bookings')
    console.log('Bookings count:', bookingsCount)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableExists: Array.isArray(tableCheck) && tableCheck.length > 0,
      bookingsCount: Array.isArray(bookingsCount) ? bookingsCount[0] : 0
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}