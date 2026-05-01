import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...')
    await executeQuery('SELECT 1')
    console.log('✓ Basic connection works')

    // Test 2: Check if bookings table exists
    console.log('Test 2: Checking if bookings table exists...')
    const tables = await executeQuery('SHOW TABLES')
    console.log('Tables in database:', tables)
    
    // Test 3: Try to count bookings
    console.log('Test 3: Counting bookings...')
    const count = await executeQuery('SELECT COUNT(*) as total FROM bookings')
    console.log('Bookings count:', count)

    // Test 4: Try to fetch one booking
    console.log('Test 4: Fetching one booking...')
    const oneBooking = await executeQuery('SELECT * FROM bookings LIMIT 1')
    console.log('One booking:', oneBooking)

    return NextResponse.json({
      success: true,
      tests: {
        connection: 'OK',
        tablesFound: Array.isArray(tables) ? tables.length : 0,
        bookingsCount: Array.isArray(count) && count[0] ? (count[0] as any).total : 0,
        sampleBooking: Array.isArray(oneBooking) && oneBooking[0] ? oneBooking[0] : null
      }
    })
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      sqlMessage: (error as any)?.sqlMessage
    }, { status: 500 })
  }
}
