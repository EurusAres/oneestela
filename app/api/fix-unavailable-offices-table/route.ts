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
    results.steps.push('Checking if unavailable_offices table exists...');
    try {
      const tableCheck = await executeQuery(
        "SHOW TABLES LIKE 'unavailable_offices'"
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
        const structure = await executeQuery("DESCRIBE unavailable_offices");
        results.currentStructure = structure;
        results.steps.push('Current structure retrieved');
      } catch (error) {
        results.errors.push(`Error checking structure: ${error}`);
      }
    }

    // Step 3: Drop and recreate table with correct structure
    results.steps.push('Dropping existing table...');
    try {
      await executeQuery('DROP TABLE IF EXISTS unavailable_offices');
      results.steps.push('Table dropped successfully');
    } catch (error) {
      results.errors.push(`Error dropping table: ${error}`);
    }

    // Step 4: Create table with correct structure
    results.steps.push('Creating table with correct structure...');
    try {
      await executeQuery(`
        CREATE TABLE unavailable_offices (
          id INT PRIMARY KEY AUTO_INCREMENT,
          office_room_id INT NOT NULL,
          reason VARCHAR(500),
          unavailable_rooms INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
          INDEX idx_office_room_id (office_room_id)
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
      const newStructure = await executeQuery("DESCRIBE unavailable_offices");
      results.newStructure = newStructure;
      results.steps.push('New structure verified');
    } catch (error) {
      results.errors.push(`Error verifying structure: ${error}`);
    }

    // Step 6: Test insert
    results.steps.push('Testing insert operation...');
    try {
      // Get first office room ID
      const offices = await executeQuery('SELECT id FROM office_rooms LIMIT 1');
      if ((offices as any[]).length > 0) {
        const testOfficeId = (offices as any[])[0].id;
        const testReason = 'Test reason with custom text';

        await executeQuery(
          `INSERT INTO unavailable_offices (office_room_id, reason, unavailable_rooms, created_at)
           VALUES (?, ?, ?, NOW())`,
          [testOfficeId, testReason, 1]
        );
        results.steps.push('Test insert successful');

        // Clean up test data
        await executeQuery(
          'DELETE FROM unavailable_offices WHERE reason = ?',
          [testReason]
        );
        results.steps.push('Test data cleaned up');
      } else {
        results.steps.push('No office rooms found for test insert');
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
    console.error('Error fixing unavailable_offices table:', error);
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
