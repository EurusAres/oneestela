import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      steps: [],
      venuesFound: 0,
      venuesRestored: 0
    };

    // Check current venues
    results.steps.push('Checking existing venues...');
    const existingVenues = await executeQuery(
      'SELECT * FROM venues',
      []
    ) as any[];

    results.venuesFound = existingVenues.length;
    results.existingVenues = existingVenues;
    results.steps.push(`Found ${existingVenues.length} venues`);

    if (existingVenues.length >= 4) {
      return NextResponse.json({
        success: true,
        message: 'Venues already exist',
        results
      });
    }

    // Restore venues
    results.steps.push('Restoring missing venues...');
    
    const sampleVenues = [
      {
        name: 'Grand Ballroom',
        description: 'Our largest and most elegant space, perfect for weddings and large corporate events. Features crystal chandeliers, hardwood floors, and a built-in stage.',
        location: 'Main Building - 2nd Floor',
        capacity: 200,
        pricePerHour: 500,
        amenities: JSON.stringify(['Stage', 'Sound System', 'Lighting', 'Air Conditioning', 'Tables & Chairs']),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HcmFuZCBCYWxscm9vbTwvdGV4dD48L3N2Zz4=',
        image360Url: null
      },
      {
        name: 'Garden Pavilion',
        description: 'An outdoor covered pavilion surrounded by lush gardens. Ideal for intimate weddings, garden parties, and outdoor receptions.',
        location: 'Garden Area',
        capacity: 100,
        pricePerHour: 350,
        amenities: JSON.stringify(['Outdoor Setting', 'Garden View', 'Lighting', 'Tables & Chairs']),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U4ZjVlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYXJkZW4gUGF2aWxpb248L3RleHQ+PC9zdmc+',
        image360Url: null
      },
      {
        name: 'Conference Hall',
        description: 'Modern conference space equipped with the latest AV technology. Perfect for corporate meetings, seminars, and business events.',
        location: 'Main Building - 3rd Floor',
        capacity: 80,
        pricePerHour: 300,
        amenities: JSON.stringify(['Projector', 'Screen', 'Whiteboard', 'Video Conferencing', 'WiFi', 'Air Conditioning']),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UzZjJmZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db25mZXJlbmNlIEhhbGw8L3RleHQ+PC9zdmc+',
        image360Url: null
      },
      {
        name: 'Rooftop Terrace',
        description: 'Stunning rooftop venue with panoramic city views. Perfect for cocktail parties, networking events, and sunset celebrations.',
        location: 'Rooftop',
        capacity: 120,
        pricePerHour: 450,
        amenities: JSON.stringify(['City View', 'Bar Area', 'Lounge Seating', 'Ambient Lighting', 'Sound System']),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZjhlNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Sb29mdG9wIFRlcnJhY2U8L3RleHQ+PC9zdmc+',
        image360Url: null
      }
    ];

    const insertedVenues = [];

    for (const venue of sampleVenues) {
      // Check if venue already exists by name
      const existing = await executeQuery(
        'SELECT id FROM venues WHERE name = ?',
        [venue.name]
      ) as any[];

      if (existing.length === 0) {
        const result = await executeQuery(
          `INSERT INTO venues 
           (name, description, location, capacity, price_per_hour, amenities, image_url, image_360_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            venue.name,
            venue.description,
            venue.location,
            venue.capacity,
            venue.pricePerHour,
            venue.amenities,
            venue.imageUrl,
            venue.image360Url
          ]
        );
        insertedVenues.push({ name: venue.name, id: (result as any).insertId });
        results.steps.push(`Inserted: ${venue.name}`);
      } else {
        results.steps.push(`Already exists: ${venue.name}`);
      }
    }

    results.venuesRestored = insertedVenues.length;

    // Fetch final venue list
    const finalVenues = await executeQuery(
      'SELECT * FROM venues',
      []
    ) as any[];

    results.finalVenues = finalVenues;
    results.steps.push(`Total venues now: ${finalVenues.length}`);

    return NextResponse.json({
      success: true,
      message: `Restored ${insertedVenues.length} venues. Total: ${finalVenues.length}`,
      results
    });

  } catch (error) {
    console.error('Error checking/restoring venues:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
