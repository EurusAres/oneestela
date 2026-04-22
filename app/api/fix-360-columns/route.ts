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
    // Modify image_360_url column in venues table to LONGTEXT
    try {
      await executeQuery(`
        ALTER TABLE venues 
        MODIFY COLUMN image_360_url LONGTEXT
      `)
      results.fixes.push('✅ Updated venues.image_360_url to LONGTEXT')
    } catch (error: any) {
      results.errors.push(`❌ venues.image_360_url: ${error.message}`)
    }

    // Modify image_360_url column in office_rooms table to LONGTEXT
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        MODIFY COLUMN image_360_url LONGTEXT
      `)
      results.fixes.push('✅ Updated office_rooms.image_360_url to LONGTEXT')
    } catch (error: any) {
      results.errors.push(`❌ office_rooms.image_360_url: ${error.message}`)
    }

    // Also fix image_url columns while we're at it
    try {
      await executeQuery(`
        ALTER TABLE venues 
        MODIFY COLUMN image_url LONGTEXT
      `)
      results.fixes.push('✅ Updated venues.image_url to LONGTEXT')
    } catch (error: any) {
      results.errors.push(`❌ venues.image_url: ${error.message}`)
    }

    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        MODIFY COLUMN image_url LONGTEXT
      `)
      results.fixes.push('✅ Updated office_rooms.image_url to LONGTEXT')
    } catch (error: any) {
      results.errors.push(`❌ office_rooms.image_url: ${error.message}`)
    }

    // Verify the changes
    const venuesColumns = await executeQuery('DESCRIBE venues')
    const officeRoomsColumns = await executeQuery('DESCRIBE office_rooms')

    results.success = results.errors.length === 0

    return NextResponse.json({
      ...results,
      venuesColumns,
      officeRoomsColumns
    })
  } catch (error) {
    console.error('Error fixing 360 columns:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix 360 columns', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
