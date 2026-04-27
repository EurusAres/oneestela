import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      tableExists: false,
      tableStructure: null,
      rowCount: 0,
      sampleData: [],
      venues: []
    };

    // Check if table exists
    try {
      const tableCheck = await executeQuery(
        "SHOW TABLES LIKE 'unavailable_dates'"
      );
      results.tableExists = (tableCheck as any[]).length > 0;
    } catch (error) {
      results.tableCheckError = String(error);
    }

    if (results.tableExists) {
      // Get table structure
      try {
        results.tableStructure = await executeQuery("DESCRIBE unavailable_dates");
      } catch (error) {
        results.structureError = String(error);
      }

      // Get row count
      try {
        const countResult = await executeQuery(
          "SELECT COUNT(*) as count FROM unavailable_dates"
        );
        results.rowCount = (countResult as any[])[0].count;
      } catch (error) {
        results.countError = String(error);
      }

      // Get sample data
      try {
        const sampleData = await executeQuery(`
          SELECT ud.*, v.name as venue_name 
          FROM unavailable_dates ud 
          LEFT JOIN venues v ON ud.venue_id = v.id 
          LIMIT 10
        `);
        results.sampleData = sampleData;
      } catch (error) {
        results.sampleDataError = String(error);
      }
    }

    // Check venues table
    try {
      const venues = await executeQuery("SELECT id, name FROM venues LIMIT 5");
      results.venues = venues;
    } catch (error) {
      results.venuesError = String(error);
    }

    // Test the actual API endpoint
    try {
      const apiResponse = await fetch(`${request.nextUrl.origin}/api/unavailable-dates`);
      const apiData = await apiResponse.json();
      results.apiResponse = {
        status: apiResponse.status,
        data: apiData
      };
    } catch (error) {
      results.apiError = String(error);
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error checking unavailable dates:', error);
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
