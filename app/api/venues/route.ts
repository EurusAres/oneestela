import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT * FROM venues ORDER BY name ASC';
    const venues = await executeQuery(query);

    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, location, capacity, pricePerHour, imageUrl, amenities } = await request.json();

    if (!name || !capacity || !pricePerHour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO venues 
       (name, description, location, capacity, price_per_hour, image_url, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, location, capacity, pricePerHour, imageUrl, JSON.stringify(amenities || [])]
    );

    return NextResponse.json(
      { message: 'Venue created', venueId: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
