import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const includeAll = searchParams.get('includeAll') === 'true';

    // First, get all office rooms
    let query = 'SELECT * FROM office_rooms';
    const params: any[] = [];

    // Add WHERE clause
    const conditions: string[] = [];
    if (!includeAll) {
      conditions.push('status = ?');
      params.push('available');
    }
    if (venueId) {
      conditions.push('venue_id = ?');
      params.push(venueId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name ASC';

    const rooms = await executeQuery(query, params);

    // Get unavailable rooms data with details
    let unavailableRooms: any[] = [];
    try {
      const unavailableQuery = `
        SELECT 
          office_room_id, 
          reason,
          unavailable_rooms,
          created_at
        FROM unavailable_offices 
        ORDER BY office_room_id, created_at
      `;
      unavailableRooms = await executeQuery(unavailableQuery, []) as any[];
    } catch (error) {
      console.log('Unavailable offices table not found or empty, using original available rooms');
    }

    // Get confirmed bookings for office spaces (exclude completed bookings)
    let bookedRooms: any[] = [];
    try {
      const bookingsQuery = `
        SELECT 
          SUBSTRING(event_type, 8) as office_room_id,
          COUNT(*) as booked_count
        FROM bookings 
        WHERE event_type LIKE 'office-%' 
        AND status IN ('confirmed', 'pending')
        GROUP BY event_type
      `;
      bookedRooms = await executeQuery(bookingsQuery, []) as any[];
    } catch (error) {
      console.log('Bookings table not found or empty, using original available rooms');
    }

    // Create maps for unavailable and booked rooms
    const unavailableMap = new Map();
    const unavailableEntriesMap = new Map();
    
    // Group unavailable rooms by office_room_id
    unavailableRooms.forEach((item: any) => {
      const roomId = item.office_room_id;
      const currentCount = unavailableMap.get(roomId) || 0;
      unavailableMap.set(roomId, currentCount + (parseInt(item.unavailable_rooms) || 0));
      
      const currentEntries = unavailableEntriesMap.get(roomId) || [];
      currentEntries.push({
        reason: item.reason,
        unavailable_rooms: parseInt(item.unavailable_rooms) || 0,
        created_at: item.created_at
      });
      unavailableEntriesMap.set(roomId, currentEntries);
    });

    const bookedMap = new Map();
    bookedRooms.forEach((item: any) => {
      const roomId = parseInt(item.office_room_id);
      if (!isNaN(roomId)) {
        bookedMap.set(roomId, parseInt(item.booked_count) || 0);
      }
    });

    // Ensure all rooms have the expected fields and calculate actual available rooms
    const normalizedRooms = (rooms as any[]).map(room => {
      const unavailableCount = unavailableMap.get(room.id) || 0;
      const bookedCount = bookedMap.get(room.id) || 0;
      const totalOccupied = Number(unavailableCount) + Number(bookedCount);
      const actualAvailableRooms = Math.max(0, Number(room.available_rooms || 0) - totalOccupied);
      const unavailableEntries = unavailableEntriesMap.get(room.id) || [];
      
      return {
        ...room,
        image_360_url: room.image_360_url || '',
        type: room.type || 'office',
        available_rooms: actualAvailableRooms,
        unavailable_entries: unavailableEntries,
        unavailable_count: unavailableCount
      };
    });

    return NextResponse.json({ rooms: normalizedRooms });
  } catch (error) {
    console.error('Error fetching office rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST request body:', body);
    
    const { 
      venueId, 
      name, 
      description, 
      capacity, 
      pricePerHour, 
      availableRooms,
      imageUrl, 
      image360Url,
      amenities,
      type = 'office'
    } = body;

    console.log('Parsed values:', { name, capacity, pricePerHour, type });

    if (!name || !capacity) {
      console.error('Validation failed: missing name or capacity');
      return NextResponse.json(
        { error: 'Missing required fields: name and capacity are required' },
        { status: 400 }
      );
    }

    // Prepare amenities - handle both array and string
    let amenitiesJson;
    if (Array.isArray(amenities)) {
      amenitiesJson = JSON.stringify(amenities);
    } else if (typeof amenities === 'string') {
      amenitiesJson = amenities;
    } else {
      amenitiesJson = JSON.stringify([]);
    }

    const query = `INSERT INTO office_rooms 
      (venue_id, name, description, capacity, price_per_hour, available_rooms, image_url, image_360_url, amenities, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      venueId || null, 
      name, 
      description || '', 
      parseInt(capacity) || 0, 
      parseFloat(pricePerHour) || 0, 
      parseInt(availableRooms) || 1,
      imageUrl || '', 
      image360Url || '',
      amenitiesJson,
      type || 'office',
      'available'
    ];

    console.log('Executing query with values:', values);

    const result = await executeQuery(query, values);

    console.log('Insert successful, result:', result);

    return NextResponse.json(
      { message: 'Space created successfully', roomId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating office room:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error message
    let errorMessage = 'Internal server error';
    if (error.message) {
      if (error.message.includes('Unknown column')) {
        errorMessage = 'Database schema needs update. Please run the migration script.';
      } else if (error.message.includes('Duplicate entry')) {
        errorMessage = 'A space with this name already exists';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PATCH request received:', body);
    
    const { 
      id,
      name, 
      description, 
      capacity, 
      pricePerHour, 
      availableRooms,
      imageUrl, 
      image360Url,
      amenities,
      type,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing room ID' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      params.push(capacity);
    }
    if (pricePerHour !== undefined) {
      updates.push('price_per_hour = ?');
      params.push(pricePerHour);
    }
    if (availableRooms !== undefined) {
      updates.push('available_rooms = ?');
      params.push(availableRooms);
    }
    if (imageUrl !== undefined) {
      updates.push('image_url = ?');
      params.push(imageUrl);
      console.log('Updating image_url to:', imageUrl);
    }
    if (image360Url !== undefined) {
      updates.push('image_360_url = ?');
      params.push(image360Url);
    }
    if (amenities !== undefined) {
      updates.push('amenities = ?');
      params.push(JSON.stringify(amenities));
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(id);

    const query = `UPDATE office_rooms SET ${updates.join(', ')} WHERE id = ?`;
    console.log('Executing query:', query);
    console.log('With params:', params);

    await executeQuery(query, params);

    return NextResponse.json({ message: 'Space updated successfully' });
  } catch (error) {
    console.error('Error updating office room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing room ID' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM office_rooms WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error('Error deleting office room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
