import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = `
      SELECT b.*, 
             b.event_name, 
             b.event_type,
             b.decline_reason,
             o.name as room_name, 
             o.image_url,
             u.full_name as user_name, 
             u.email as user_email, 
             u.phone as user_phone
      FROM bookings b
      LEFT JOIN office_rooms o ON b.office_room_id = o.id
      LEFT JOIN users u ON b.user_id = u.id
    `;
    const params: any[] = [];

    if (userId) {
      query += ' WHERE b.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY b.created_at ASC';

    const bookings = await executeQuery(query, params);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Received booking data:', JSON.stringify(body, null, 2));
    
    // Handle both API formats: office room booking and event booking
    const userId = body.userId;
    const isOfficeInquiry = (body.eventType || '').startsWith('office-');

    // Resolve officeRoomId
    let officeRoomId = body.officeRoomId;
    
    if (isOfficeInquiry && body.eventType) {
      // Extract office room ID from eventType (format: "office-20")
      const parts = body.eventType.split('-');
      if (parts.length === 2 && parts[0] === 'office') {
        officeRoomId = parseInt(parts[1]);
      }
    }
    
    // Fall back to the first room in the DB if not provided
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
    
    // Handle date formatting more carefully
    let checkInDate, checkOutDate;
    
    if (isOfficeInquiry) {
      // For office inquiries, use placeholder dates since they don't need specific dates
      checkInDate = '2024-01-01 09:00:00';
      checkOutDate = '2024-01-01 17:00:00';
    } else {
      // For event bookings, handle date formatting as before
      if (body.checkInDate) {
        checkInDate = body.checkInDate;
      } else if (body.date) {
        const dateStr = body.date.includes('T') ? body.date.split('T')[0] : body.date;
        checkInDate = `${dateStr} ${body.startTime || '09:00:00'}`;
      }
      
      if (body.checkOutDate) {
        checkOutDate = body.checkOutDate;
      } else if (body.date) {
        const dateStr = body.date.includes('T') ? body.date.split('T')[0] : body.date;
        checkOutDate = `${dateStr} ${body.endTime || '17:00:00'}`;
      }
    }
    
    const numberOfGuests = body.numberOfGuests || body.guestCount || 1;
    const specialRequests = body.specialRequests || '';
    const totalPrice = body.totalPrice || 0;
    const eventName = body.eventName || 'Event Booking';
    const eventType = body.eventType || 'general';

    console.log('Processed values:', { userId, officeRoomId, checkInDate, checkOutDate, numberOfGuests, eventName, eventType, isOfficeInquiry });

    if (!userId) {
      console.error('Validation failed: Missing userId');
      return NextResponse.json(
        { error: 'Missing required field: userId is required', received: { userId } },
        { status: 400 }
      );
    }

    if (!isOfficeInquiry && (!checkInDate || !checkOutDate)) {
      console.error('Validation failed for event booking:', { userId, checkInDate, checkOutDate });
      return NextResponse.json(
        { error: 'Missing required fields for event booking: date/checkInDate and time/checkOutDate are required', received: { userId, checkInDate, checkOutDate } },
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

    // Return the created booking with proper structure
    const newBooking = {
      id: insertId.toString(),
      userId,
      eventName: body.eventName || 'Event Booking',
      eventType: body.eventType || 'general',
      guestCount: numberOfGuests,
      date: body.date || checkInDate.split(' ')[0],
      startTime: body.startTime || checkInDate.split(' ')[1] || '09:00',
      endTime: body.endTime || checkOutDate.split(' ')[1] || '17:00',
      specialRequests,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      total: totalPrice.toString(),
      userInfo: body.userInfo || { name: '', email: '', phone: '' }
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

    // Build dynamic update query based on provided fields
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

    // Soft delete by updating status to cancelled
    await executeQuery(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    // Also update any associated payment proofs to cancelled status
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
