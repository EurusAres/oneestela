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
    // Add image_360_url column to venues table
    try {
      await executeQuery(`
        ALTER TABLE venues 
        ADD COLUMN image_360_url VARCHAR(500)
      `)
      results.fixes.push('✅ Added image_360_url column to venues table')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ image_360_url column already exists in venues table')
      } else {
        results.errors.push(`❌ venues.image_360_url: ${error.message}`)
      }
    }

    // Add image_360_url column to office_rooms table
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        ADD COLUMN image_360_url VARCHAR(500)
      `)
      results.fixes.push('✅ Added image_360_url column to office_rooms table')
    } catch (error: any) {
      if (error.message && (error.message.includes('Duplicate column') || error.message.includes('duplicate column'))) {
        results.fixes.push('✅ image_360_url column already exists in office_rooms table')
      } else {
        results.errors.push(`❌ office_rooms.image_360_url: ${error.message}`)
      }
    }

    // Verify the changes
    const venuesColumns = await executeQuery('DESCRIBE venues')
    const officeRoomsColumns = await executeQuery('DESCRIBE office_rooms')

    return NextResponse.json({
      ...results,
      venuesColumns,
      officeRoomsColumns
    })
  } catch (error) {
    console.error('Error adding 360 columns:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add 360 columns', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
