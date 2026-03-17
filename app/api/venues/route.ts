import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = 'SELECT * FROM venues ORDER BY name ASC';
    const venues = await executeQuery(query);

    // Ensure all venues have the expected fields
    const normalizedVenues = (venues as any[]).map(venue => ({
      ...venue,
      image_360_url: venue.image_360_url || ''
    }));

    return NextResponse.json({ venues: normalizedVenues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      description, 
      location, 
      capacity, 
      pricePerHour, 
      imageUrl, 
      image360Url,
      amenities 
    } = await request.json();

    if (!name || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to insert with all columns, but handle if columns don't exist
    try {
      const result = await executeQuery(
        `INSERT INTO venues 
         (name, description, location, capacity, price_per_hour, image_url, image_360_url, amenities)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          description || '', 
          location || '', 
          capacity, 
          pricePerHour || 0, 
          imageUrl || '', 
          image360Url || '',
          JSON.stringify(amenities || [])
        ]
      );

      return NextResponse.json(
        { message: 'Venue created successfully', venueId: (result as any).insertId },
        { status: 201 }
      );
    } catch (insertError: any) {
      // If columns don't exist, try without them
      if (insertError.message && insertError.message.includes('Unknown column')) {
        const result = await executeQuery(
          `INSERT INTO venues 
           (name, description, location, capacity, price_per_hour, image_url, amenities)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            name, 
            description || '', 
            location || '', 
            capacity, 
            pricePerHour || 0, 
            imageUrl || '', 
            JSON.stringify(amenities || [])
          ]
        );

        return NextResponse.json(
          { 
            message: 'Venue created successfully (without 360° image support)', 
            venueId: (result as any).insertId,
            warning: 'Please run database migration to enable 360° images'
          },
          { status: 201 }
        );
      }
      throw insertError;
    }
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { 
      id,
      name, 
      description, 
      location, 
      capacity, 
      pricePerHour, 
      imageUrl, 
      image360Url,
      amenities 
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing venue ID' },
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
    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      params.push(capacity);
    }
    if (pricePerHour !== undefined) {
      updates.push('price_per_hour = ?');
      params.push(pricePerHour);
    }
    if (imageUrl !== undefined) {
      updates.push('image_url = ?');
      params.push(imageUrl);
    }
    if (image360Url !== undefined) {
      updates.push('image_360_url = ?');
      params.push(image360Url);
    }
    if (amenities !== undefined) {
      updates.push('amenities = ?');
      params.push(JSON.stringify(amenities));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(id);

    await executeQuery(
      `UPDATE venues SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return NextResponse.json({ message: 'Venue updated successfully' });
  } catch (error) {
    console.error('Error updating venue:', error);
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
        { error: 'Missing venue ID' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM venues WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
