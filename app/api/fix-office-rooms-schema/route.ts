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
    // Add available_rooms column
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        ADD COLUMN available_rooms INT DEFAULT 1
      `)
      results.fixes.push('✅ Added available_rooms column to office_rooms table')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ available_rooms column already exists')
      } else {
        results.errors.push(`❌ available_rooms: ${error.message}`)
      }
    }

    // Add type column
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        ADD COLUMN type VARCHAR(100) DEFAULT 'office'
      `)
      results.fixes.push('✅ Added type column to office_rooms table')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ type column already exists')
      } else {
        results.errors.push(`❌ type: ${error.message}`)
      }
    }

    // Verify the changes
    const columns = await executeQuery('DESCRIBE office_rooms')
    
    results.success = results.errors.length === 0

    return NextResponse.json({
      ...results,
      columns
    })
  } catch (error) {
    console.error('Error fixing office_rooms schema:', error)
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
