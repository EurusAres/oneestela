import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    const { venueId, date, reason, createdBy } = body;

    // Log each field
    console.log('venueId:', venueId, typeof venueId);
    console.log('date:', date, typeof date);
    console.log('reason:', reason, typeof reason);
    console.log('createdBy:', createdBy, typeof createdBy);

    // Check if table exists
    const tableCheck = await executeQuery(
      "SHOW TABLES LIKE 'unavailable_dates'"
    );
    console.log('Table exists:', tableCheck);

    // Check table structure
    const structure = await executeQuery(
      "DESCRIBE unavailable_dates"
    );
    console.log('Table structure:', structure);

    // Try to insert
    try {
      const result = await executeQuery(
        `INSERT INTO unavailable_dates (venue_id, date, reason, notes, created_by)
         VALUES (?, STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`,
        [venueId, date, reason, '', createdBy || 'admin']
      );
      console.log('Insert result:', result);

      return NextResponse.json({
        success: true,
        message: 'Test insert successful',
        result
      });
    } catch (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: insertError instanceof Error ? insertError.message : String(insertError),
        stack: insertError instanceof Error ? insertError.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
