import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST() {
  try {
    // Update bookings with amounts from payment proofs
    const result = await executeQuery(`
      UPDATE bookings b
      INNER JOIN payment_proofs pp ON b.id = pp.booking_id
      SET b.total_price = pp.amount
      WHERE b.total_price IS NULL OR b.total_price = 0
    `);

    // Get updated bookings
    const updatedBookings = await executeQuery(`
      SELECT 
        b.id as booking_id,
        b.total_price as booking_amount,
        pp.amount as payment_amount,
        pp.payment_method,
        u.full_name as customer_name
      FROM bookings b
      INNER JOIN payment_proofs pp ON b.id = pp.booking_id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.total_price = pp.amount
      ORDER BY b.id DESC
    `) as any[];

    return NextResponse.json({
      success: true,
      message: 'Booking amounts synced successfully',
      affectedRows: (result as any).affectedRows,
      updatedBookings,
    });
  } catch (error) {
    console.error('Error syncing booking amounts:', error);
    return NextResponse.json(
      { error: 'Failed to sync booking amounts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
