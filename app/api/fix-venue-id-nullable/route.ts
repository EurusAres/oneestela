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
    // Make venue_id nullable and set default to 1 (main venue)
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        MODIFY COLUMN venue_id INT DEFAULT 1
      `)
      results.fixes.push('✅ Made venue_id nullable with default value 1')
    } catch (error: any) {
      results.errors.push(`❌ venue_id: ${error.message}`)
    }

    // Verify the change
    const columns = await executeQuery('DESCRIBE office_rooms')
    
    results.success = results.errors.length === 0

    return NextResponse.json({
      ...results,
      columns
    })
  } catch (error) {
    console.error('Error fixing venue_id:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix venue_id', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
