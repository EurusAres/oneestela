import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  const results: any = {
    success: true,
    fixes: [],
    errors: []
  }

  try {
    // Add check_in_date column
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN check_in_date DATE
      `)
      results.fixes.push('✅ Added check_in_date column')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ check_in_date column already exists')
      } else {
        results.errors.push(`❌ check_in_date: ${error.message}`)
      }
    }

    // Add check_out_date column
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN check_out_date DATE
      `)
      results.fixes.push('✅ Added check_out_date column')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ check_out_date column already exists')
      } else {
        results.errors.push(`❌ check_out_date: ${error.message}`)
      }
    }

    // Add number_of_guests column
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN number_of_guests INT
      `)
      results.fixes.push('✅ Added number_of_guests column')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ number_of_guests column already exists')
      } else {
        results.errors.push(`❌ number_of_guests: ${error.message}`)
      }
    }

    // Add total_price column
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN total_price DECIMAL(10, 2)
      `)
      results.fixes.push('✅ Added total_price column')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ total_price column already exists')
      } else {
        results.errors.push(`❌ total_price: ${error.message}`)
      }
    }

    // Verify the changes
    const columns = await executeQuery('DESCRIBE bookings')
    
    results.success = results.errors.length === 0

    return NextResponse.json({
      ...results,
      columns
    })
  } catch (error) {
    console.error('Error fixing bookings schema:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix schema', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
