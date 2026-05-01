import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasDbHost: !!process.env.DB_HOST,
      hasDbPassword: !!process.env.DB_PASSWORD,
    },
    tests: {}
  };

  try {
    // Test 1: Basic connection
    diagnostics.tests.connection = 'Testing...';
    await executeQuery('SELECT 1 as test');
    diagnostics.tests.connection = 'OK';

    // Test 2: Check bookings table
    diagnostics.tests.bookingsTable = 'Testing...';
    const count = await executeQuery('SELECT COUNT(*) as total FROM bookings');
    const countValue = Array.isArray(count) && count[0] ? (count[0] as any).total : 0;
    diagnostics.tests.bookingsTable = `OK - ${countValue} bookings found`;

    // Test 3: Fetch bookings with simple query
    diagnostics.tests.simpleQuery = 'Testing...';
    const bookings = await executeQuery('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10');
    diagnostics.tests.simpleQuery = `OK - ${Array.isArray(bookings) ? bookings.length : 0} bookings returned`;
    diagnostics.tests.sampleBooking = Array.isArray(bookings) && bookings[0] ? bookings[0] : null;

    // Test 4: Non-parameterized LIMIT query (what the main API now uses)
    diagnostics.tests.nonParamQuery = 'Testing...';
    const nonParamBookings = await executeQuery(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100 OFFSET 0',
      []
    );
    diagnostics.tests.nonParamQuery = `OK - ${Array.isArray(nonParamBookings) ? nonParamBookings.length : 0} bookings returned`;
    
    // Test 5: Parameterized WHERE query
    diagnostics.tests.paramWhereQuery = 'Testing...';
    const paramWhereBookings = await executeQuery(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [4]
    );
    diagnostics.tests.paramWhereQuery = `OK - ${Array.isArray(paramWhereBookings) ? paramWhereBookings.length : 0} bookings returned`;

    diagnostics.overallStatus = 'SUCCESS';
    return NextResponse.json(diagnostics);

  } catch (error) {
    diagnostics.overallStatus = 'FAILED';
    diagnostics.error = {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      sqlMessage: (error as any)?.sqlMessage,
      stack: error instanceof Error ? error.stack : undefined,
    };
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
