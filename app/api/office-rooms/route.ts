import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');

    let query = 'SELECT * FROM office_rooms WHERE status = "available"';
    const params: any[] = [];

    if (venueId) {
      query += ' AND venue_id = ?';
      params.push(venueId);
    }

    query += ' ORDER BY name ASC';

    const rooms = await executeQuery(query, params);

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching office rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { venueId, name, description, capacity, pricePerHour, imageUrl, amenities } = await request.json();

    if (!venueId || !name || !capacity || !pricePerHour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO office_rooms 
       (venue_id, name, description, capacity, price_per_hour, image_url, amenities, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [venueId, name, description, capacity, pricePerHour, imageUrl, JSON.stringify(amenities || []), 'available']
    );

    return NextResponse.json(
      { message: 'Office room created', roomId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating office room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
