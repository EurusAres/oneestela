import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Use string concatenation instead of parameterized LIMIT/OFFSET
    // MySQL has issues with parameterized LIMIT in some configurations
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get('limit') || '100')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    let query: string;
    let params: any[] = [];

    // Join with users table to get customer information
    const baseQuery = `
      SELECT 
        b.*,
        u.full_name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        o.name as room_name,
        v.name as venue_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN office_rooms o ON b.office_room_id = o.id
      LEFT JOIN venues v ON b.venue_id = v.id
    `;

    if (userId) {
      // Only use parameterized query for WHERE clause
      query = `${baseQuery} WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      params = [parseInt(userId)];
    } else {
      // No parameters needed
      query = `${baseQuery} ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      params = [];
    }

    console.log('Executing bookings query:', query, 'with params:', params);
    const result = await executeQuery(query, params);
    console.log('Query result type:', typeof result, 'isArray:', Array.isArray(result));
    
    const bookings = Array.isArray(result) ? result : [];
    console.log('Returning bookings count:', bookings.length);

    return NextResponse.json({ 
      bookings,
      count: bookings.length,
      success: true
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Bookings API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        sqlMessage: (error as any)?.sqlMessage,
        bookings: [],
        count: 0,
        success: false
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const userId = body.userId;
    const isOfficeInquiry = (body.eventType || '').startsWith('office-');

    let officeRoomId = body.officeRoomId;
    
    if (isOfficeInquiry && body.eventType) {
      const parts = body.eventType.split('-');
      if (parts.length === 2 && parts[0] === 'office') {
        officeRoomId = parseInt(parts[1]);
      }
    }
    
    if (!officeRoomId) {
      const rooms = await executeQuery('SELECT id FROM office_rooms ORDER BY id ASC LIMIT 1') as any[];
      if (!rooms || rooms.length === 0) {
        return NextResponse.json(
          { error: 'No office rooms found. Please seed the database first.' },
          { status: 400 }
        );
      }
      officeRoomId = rooms[0].id;
    }
    
    let checkInDate, checkOutDate;
    
    const convertTo24Hour = (time12h: string): string => {
      if (!time12h) return '09:00:00';
      if (time12h.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        return time12h.includes(':') && time12h.split(':').length === 2 ? `${time12h}:00` : time12h;
      }
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM' || modifier === 'pm') {
        hours = String(parseInt(hours, 10) + 12);
      }
      return `${hours.padStart(2, '0')}:${minutes}:00`;
    };
    
    if (isOfficeInquiry) {
      const now = new Date();
      const currentDateStr = now.toISOString().split('T')[0];
      checkInDate = `${currentDateStr} 09:00:00`;
      checkOutDate = `${currentDateStr} 17:00:00`;
    } else {
      if (body.checkInDate) {
        checkInDate = body.checkInDate;
      } else if (body.date) {
        const dateStr = body.date.includes('T') ? body.date.split('T')[0] : body.date;
        const startTime24 = convertTo24Hour(body.startTime);
        checkInDate = `${dateStr} ${startTime24}`;
      }
      
      if (body.checkOutDate) {
        checkOutDate = body.checkOutDate;
      } else if (body.date) {
        const dateStr = body.date.includes('T') ? body.date.split('T')[0] : body.date;
        const endTime24 = convertTo24Hour(body.endTime);
        checkOutDate = `${dateStr} ${endTime24}`;
      }
    }
    
    const numberOfGuests = body.numberOfGuests || body.guestCount || 1;
    const specialRequests = body.specialRequests || '';
    const totalPrice = body.totalPrice || 0;
    const eventName = body.eventName || 'Event Booking';
    const eventType = body.eventType || 'general';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId is required' },
        { status: 400 }
      );
    }

    if (!isOfficeInquiry && (!checkInDate || !checkOutDate)) {
      return NextResponse.json(
        { error: 'Missing required fields for event booking' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO bookings 
       (user_id, event_name, event_type, office_room_id, check_in_date, check_out_date, number_of_guests, special_requests, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, eventName, eventType, officeRoomId, checkInDate, checkOutDate, numberOfGuests, specialRequests, totalPrice, 'pending']
    );

    const insertId = (result as any).insertId;

    const newBooking = {
      id: insertId.toString(),
      userId,
      eventName,
      eventType,
      guestCount: numberOfGuests,
      date: body.date || checkInDate.split(' ')[0],
      startTime: body.startTime || checkInDate.split(' ')[1] || '09:00',
      endTime: body.endTime || checkOutDate.split(' ')[1] || '17:00',
      specialRequests,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      total: totalPrice.toString()
    };

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.checkInDate !== undefined) {
      updates.push('check_in_date = ?');
      values.push(body.checkInDate);
    }
    if (body.checkOutDate !== undefined) {
      updates.push('check_out_date = ?');
      values.push(body.checkOutDate);
    }
    if (body.numberOfGuests !== undefined) {
      updates.push('number_of_guests = ?');
      values.push(body.numberOfGuests);
    }
    if (body.specialRequests !== undefined) {
      updates.push('special_requests = ?');
      values.push(body.specialRequests);
    }
    if (body.totalPrice !== undefined) {
      updates.push('total_price = ?');
      values.push(body.totalPrice);
    }
    if (body.declineReason !== undefined) {
      updates.push('decline_reason = ?');
      values.push(body.declineReason);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    await executeQuery(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await executeQuery(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    await executeQuery(
      'UPDATE payment_proofs SET status = ?, verification_notes = ? WHERE booking_id = ? AND status = ?',
      ['rejected', 'Booking was cancelled by customer', id, 'pending']
    );

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
