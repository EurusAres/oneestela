import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get the current schema of bookings table
    const columns = await executeQuery('DESCRIBE bookings')
    
    // Check which columns exist
    const columnNames = (columns as any[]).map(col => col.Field)
    
    const requiredColumns = [
      'id',
      'user_id',
      'office_room_id',
      'venue_id',
      'event_name',
      'event_type',
      'check_in_date',
      'check_out_date',
      'date',
      'start_time',
      'end_time',
      'number_of_guests',
      'guest_count',
      'special_requests',
      'status',
      'decline_reason',
      'total_price',
      'total_amount',
      'created_at',
      'updated_at'
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
