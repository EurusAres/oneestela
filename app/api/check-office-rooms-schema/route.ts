import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get the current schema of office_rooms table
    const columns = await executeQuery('DESCRIBE office_rooms')
    
    // Check which columns exist
    const columnNames = (columns as any[]).map(col => col.Field)
    
    const requiredColumns = [
      'id',
      'venue_id',
      'name',
      'description',
      'capacity',
      'price_per_hour',
      'available_rooms',
      'image_url',
      'image_360_url',
      'amenities',
      'type',
      'status',
      'total_rooms',
      'unavailable_rooms'
    ]
    
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col))
    const existingColumns = requiredColumns.filter(col => columnNames.includes(col))
    
    return NextResponse.json({
      allColumns: columns,
      columnNames,
      existingColumns,
      missingColumns,
      needsMigration: missingColumns.length > 0
    })
  } catch (error) {
    console.error('Error checking schema:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check schema', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
