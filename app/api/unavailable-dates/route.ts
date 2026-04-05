import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');

    let query = `
      SELECT ud.id, ud.venue_id, DATE_FORMAT(ud.date, '%Y-%m-%d') as date, 
             ud.reason, ud.notes, ud.created_by, ud.created_at, v.name as venue_name 
      FROM unavailable_dates ud 
      JOIN venues v ON ud.venue_id = v.id
    `;
    const params: any[] = [];

    if (venueId) {
      query += ' WHERE ud.venue_id = ?';
      params.push(venueId);
    }

    query += ' ORDER BY ud.date ASC';

    const unavailableDates = await executeQuery(query, params);

    console.log('Raw database result:', unavailableDates);

    // Format dates to ensure consistency
    const formattedDates = (unavailableDates as any[]).map(item => {
      console.log('Processing item:', item);
      console.log('Original date:', item.date);
      console.log('Date type:', typeof item.date);
      
      const formattedDate = item.date instanceof Date 
        ? item.date.toISOString().split('T')[0] 
        : item.date;
        
      console.log('Formatted date:', formattedDate);
      
      return {
        ...item,
        date: formattedDate
      };
    });

    console.log('Final formatted dates:', formattedDates);

    return NextResponse.json({ unavailableDates: formattedDates });
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { venueId, date, reason, notes, createdBy } = await request.json();

    console.log('API received data:', { venueId, date, reason, notes, createdBy });

    if (!venueId || !date || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: venueId, date, and reason are required' },
        { status: 400 }
      );
    }

    // Check if date already exists for this venue
    const existingDate = await executeQuery(
      'SELECT id FROM unavailable_dates WHERE venue_id = ? AND date = ?',
      [venueId, date]
    );

    if ((existingDate as any[]).length > 0) {
      return NextResponse.json(
        { error: 'This date is already marked as unavailable for this venue' },
        { status: 409 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO unavailable_dates (venue_id, date, reason, notes, created_by)
       VALUES (?, STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`,
      [venueId, date, reason, notes || '', createdBy || 'admin']
    );

    console.log('Database insert result:', result);
    console.log('Inserted date value:', date);

    return NextResponse.json(
      { message: 'Unavailable date added successfully', id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating unavailable date:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing unavailable date ID' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM unavailable_dates WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Unavailable date removed successfully' });
  } catch (error) {
    console.error('Error deleting unavailable date:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}