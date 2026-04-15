import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const query = `
      SELECT 
        uo.id,
        uo.office_room_id,
        uo.reason,
        uo.unavailable_rooms,
        uo.created_at,
        or_table.name as office_name
      FROM unavailable_offices uo
      JOIN office_rooms or_table ON uo.office_room_id = or_table.id
      ORDER BY uo.created_at DESC
    `
    
    const unavailableOffices = await executeQuery(query)
    
    return NextResponse.json({
      success: true,
      unavailableOffices
    })
  } catch (error) {
    console.error('Error fetching unavailable offices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unavailable offices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { office_room_id, reason, unavailable_rooms } = await request.json()
    
    if (!office_room_id || !reason || !unavailable_rooms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const unavailableCount = parseInt(unavailable_rooms)
    if (isNaN(unavailableCount) || unavailableCount <= 0) {
      return NextResponse.json(
        { error: 'Invalid number of unavailable rooms' },
        { status: 400 }
      )
    }

    // Check if office room exists and get total rooms
    const officeCheck = await executeQuery(
      'SELECT id, available_rooms FROM office_rooms WHERE id = ?',
      [office_room_id]
    )
    
    if (!Array.isArray(officeCheck) || officeCheck.length === 0) {
      return NextResponse.json(
        { error: 'Office room not found' },
        { status: 404 }
      )
    }

    const currentTotalRooms = (officeCheck[0] as any).available_rooms || 0
    if (unavailableCount > currentTotalRooms) {
      return NextResponse.json(
        { error: `Cannot mark ${unavailableCount} rooms as unavailable. Only ${currentTotalRooms} rooms total.` },
        { status: 400 }
      )
    }

    // Insert unavailable office record
    const insertQuery = `
      INSERT INTO unavailable_offices (office_room_id, reason, unavailable_rooms, created_at)
      VALUES (?, ?, ?, NOW())
    `
    
    await executeQuery(insertQuery, [office_room_id, reason, unavailableCount])
    
    return NextResponse.json({
      success: true,
      message: `${unavailableCount} room(s) marked as unavailable successfully`
    })
  } catch (error) {
    console.error('Error adding unavailable office:', error)
    return NextResponse.json(
      { error: 'Failed to add unavailable office' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Check if record exists
    const existingRecord = await executeQuery(
      'SELECT id FROM unavailable_offices WHERE id = ?',
      [id]
    )
    
    if (!Array.isArray(existingRecord) || existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Unavailable office record not found' },
        { status: 404 }
      )
    }

    // Delete the record
    await executeQuery('DELETE FROM unavailable_offices WHERE id = ?', [id])
    
    return NextResponse.json({
      success: true,
      message: 'Unavailable office period removed successfully'
    })
  } catch (error) {
    console.error('Error deleting unavailable office:', error)
    return NextResponse.json(
      { error: 'Failed to delete unavailable office' },
      { status: 500 }
    )
  }
}