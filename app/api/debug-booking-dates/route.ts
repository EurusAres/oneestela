import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get all bookings with raw date values
    const bookings = await executeQuery(`
      SELECT 
        id,
        event_name,
        check_in_date,
        check_out_date,
        DATE(check_in_date) as date_only,
        TIME(check_in_date) as time_only,
        UNIX_TIMESTAMP(check_in_date) as unix_timestamp,
        created_at
      FROM bookings
      ORDER BY id DESC
      LIMIT 10
    `) as any[];

    return NextResponse.json({
      success: true,
      bookings,
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error debugging booking dates:', error);
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
