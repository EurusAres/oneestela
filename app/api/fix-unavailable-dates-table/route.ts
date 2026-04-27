import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      steps: [],
      errors: []
    };

    // Step 1: Check if table exists
    results.steps.push('Checking if unavailable_dates table exists...');
    try {
      const tableCheck = await executeQuery(
        "SHOW TABLES LIKE 'unavailable_dates'"
      );
      results.tableExists = (tableCheck as any[]).length > 0;
      results.steps.push(`Table exists: ${results.tableExists}`);
    } catch (error) {
      results.errors.push(`Error checking table: ${error}`);
    }

    // Step 2: Check table structure if it exists
    if (results.tableExists) {
      results.steps.push('Checking table structure...');
      try {
        const structure = await executeQuery("DESCRIBE unavailable_dates");
        results.currentStructure = structure;
        results.steps.push('Current structure retrieved');
      } catch (error) {
        results.errors.push(`Error checking structure: ${error}`);
      }
    }

    // Step 3: Drop and recreate table with correct structure
    results.steps.push('Dropping existing table...');
    try {
      await executeQuery('DROP TABLE IF EXISTS unavailable_dates');
      results.steps.push('Table dropped successfully');
    } catch (error) {
      results.errors.push(`Error dropping table: ${error}`);
    }

    // Step 4: Create table with correct structure
    results.steps.push('Creating table with correct structure...');
    try {
      await executeQuery(`
        CREATE TABLE unavailable_dates (
          id INT PRIMARY KEY AUTO_INCREMENT,
          venue_id INT NOT NULL,
          date DATE NOT NULL,
          reason VARCHAR(500),
          notes TEXT,
          created_by VARCHAR(255) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
          UNIQUE KEY unique_venue_date (venue_id, date),
          INDEX idx_venue_id (venue_id),
          INDEX idx_date (date)
        )
      `);
      results.steps.push('Table created successfully');
    } catch (error) {
      results.errors.push(`Error creating table: ${error}`);
      return NextResponse.json({
        success: false,
        message: 'Failed to create table',
        results
      }, { status: 500 });
    }

    // Step 5: Verify new structure
    results.steps.push('Verifying new table structure...');
    try {
      const newStructure = await executeQuery("DESCRIBE unavailable_dates");
      results.newStructure = newStructure;
      results.steps.push('New structure verified');
    } catch (error) {
      results.errors.push(`Error verifying structure: ${error}`);
    }

    // Step 6: Test insert
    results.steps.push('Testing insert operation...');
    try {
      // Get first venue ID
      const venues = await executeQuery('SELECT id FROM venues LIMIT 1');
      if ((venues as any[]).length > 0) {
        const testVenueId = (venues as any[])[0].id;
        const testDate = '2026-12-31';
        const testReason = 'Test reason with custom text';

        await executeQuery(
          `INSERT INTO unavailable_dates (venue_id, date, reason, notes, created_by)
           VALUES (?, STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`,
          [testVenueId, testDate, testReason, 'Test notes', 'admin']
        );
        results.steps.push('Test insert successful');

        // Clean up test data
        await executeQuery(
          'DELETE FROM unavailable_dates WHERE date = ?',
          [testDate]
        );
        results.steps.push('Test data cleaned up');
      } else {
        results.steps.push('No venues found for test insert');
      }
    } catch (error) {
      results.errors.push(`Error testing insert: ${error}`);
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      message: results.errors.length === 0 
        ? 'Table fixed successfully' 
        : 'Table fixed with some warnings',
      results
    });

  } catch (error) {
    console.error('Error fixing unavailable_dates table:', error);
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
