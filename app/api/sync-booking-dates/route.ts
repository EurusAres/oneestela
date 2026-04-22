import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Find all bookings with the old placeholder date (2024-01-01)
    const oldBookings = await executeQuery(
      `SELECT id, event_type, check_in_date, check_out_date 
       FROM bookings 
       WHERE check_in_date LIKE '2024-01-01%'`,
      []
    ) as any[];

    console.log(`Found ${oldBookings.length} bookings with old placeholder date`);

    const results = {
      total: oldBookings.length,
      updated: 0,
      skipped: 0,
      details: [] as any[]
    };

    for (const booking of oldBookings) {
      const isOfficeInquiry = booking.event_type?.startsWith('office-');
      
      if (isOfficeInquiry) {
        // Update office inquiries to use current date as placeholder
        const now = new Date();
        const currentDateStr = now.toISOString().split('T')[0];
        const newCheckIn = `${currentDateStr} 09:00:00`;
        const newCheckOut = `${currentDateStr} 17:00:00`;
        
        await executeQuery(
          `UPDATE bookings 
           SET check_in_date = ?, check_out_date = ? 
           WHERE id = ?`,
          [newCheckIn, newCheckOut, booking.id]
        );
        
        results.updated++;
        results.details.push({
          id: booking.id,
          type: 'office',
          action: 'updated',
          oldDate: booking.check_in_date,
          newDate: newCheckIn
        });
      } else {
        // For event bookings with wrong date, we can't automatically fix them
        // They need to be manually reviewed or cancelled
        results.skipped++;
        results.details.push({
          id: booking.id,
          type: 'event',
          action: 'skipped',
          reason: 'Event bookings with placeholder dates need manual review',
          currentDate: booking.check_in_date
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} bookings: ${results.updated} updated, ${results.skipped} skipped`,
      results
    });
  } catch (error) {
    console.error('Error syncing booking dates:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
