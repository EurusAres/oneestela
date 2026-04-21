import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test 1: Database connection
  try {
    const [testResult] = await executeQuery('SELECT 1 as test') as any[];
    results.tests.push({
      name: 'Database Connection',
      status: 'PASS',
      result: testResult
    });
  } catch (error) {
    results.tests.push({
      name: 'Database Connection',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Users table
  try {
    const users = await executeQuery('SELECT COUNT(*) as count FROM users') as any[];
    results.tests.push({
      name: 'Users Table',
      status: 'PASS',
      count: users[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Users Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 3: Bookings table
  try {
    const bookings = await executeQuery('SELECT COUNT(*) as count FROM bookings') as any[];
    results.tests.push({
      name: 'Bookings Table',
      status: 'PASS',
      count: bookings[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Bookings Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 4: Office Rooms table
  try {
    const rooms = await executeQuery('SELECT COUNT(*) as count FROM office_rooms') as any[];
    results.tests.push({
      name: 'Office Rooms Table',
      status: 'PASS',
      count: rooms[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Office Rooms Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 5: Venues table
  try {
    const venues = await executeQuery('SELECT COUNT(*) as count FROM venues') as any[];
    results.tests.push({
      name: 'Venues Table',
      status: 'PASS',
      count: venues[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Venues Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 6: Staff table
  try {
    const staff = await executeQuery('SELECT COUNT(*) as count FROM staff') as any[];
    results.tests.push({
      name: 'Staff Table',
      status: 'PASS',
      count: staff[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Staff Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 7: Reviews table
  try {
    const reviews = await executeQuery('SELECT COUNT(*) as count FROM reviews') as any[];
    results.tests.push({
      name: 'Reviews Table',
      status: 'PASS',
      count: reviews[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Reviews Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 8: Unavailable Dates table
  try {
    const unavailableDates = await executeQuery('SELECT COUNT(*) as count FROM unavailable_dates') as any[];
    results.tests.push({
      name: 'Unavailable Dates Table',
      status: 'PASS',
      count: unavailableDates[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Unavailable Dates Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 9: Unavailable Offices table
  try {
    const unavailableOffices = await executeQuery('SELECT COUNT(*) as count FROM unavailable_offices') as any[];
    results.tests.push({
      name: 'Unavailable Offices Table',
      status: 'PASS',
      count: unavailableOffices[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Unavailable Offices Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 10: Contact Messages table
  try {
    const messages = await executeQuery('SELECT COUNT(*) as count FROM contact_messages') as any[];
    results.tests.push({
      name: 'Contact Messages Table',
      status: 'PASS',
      count: messages[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Contact Messages Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 11: Check bookings table columns
  try {
    const columns = await executeQuery('DESCRIBE bookings') as any[];
    const columnNames = columns.map((c: any) => c.Field);
    const requiredColumns = ['check_in_date', 'check_out_date', 'number_of_guests', 'total_price'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    results.tests.push({
      name: 'Bookings Table Columns',
      status: missingColumns.length === 0 ? 'PASS' : 'FAIL',
      columns: columnNames,
      missingColumns
    });
  } catch (error) {
    results.tests.push({
      name: 'Bookings Table Columns',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 12: Check office_rooms table columns
  try {
    const columns = await executeQuery('DESCRIBE office_rooms') as any[];
    const columnNames = columns.map((c: any) => c.Field);
    const requiredColumns = ['available_rooms', 'image_360_url', 'type'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    results.tests.push({
      name: 'Office Rooms Table Columns',
      status: missingColumns.length === 0 ? 'PASS' : 'FAIL',
      columns: columnNames,
      missingColumns
    });
  } catch (error) {
    results.tests.push({
      name: 'Office Rooms Table Columns',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 13: Admin users
  try {
    const admins = await executeQuery('SELECT id, email, role FROM users WHERE role = "admin"') as any[];
    results.tests.push({
      name: 'Admin Users',
      status: admins.length > 0 ? 'PASS' : 'FAIL',
      admins: admins
    });
  } catch (error) {
    results.tests.push({
      name: 'Admin Users',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 14: Payment Proofs table
  try {
    const paymentProofs = await executeQuery('SELECT COUNT(*) as count FROM payment_proofs') as any[];
    results.tests.push({
      name: 'Payment Proofs Table',
      status: 'PASS',
      count: paymentProofs[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'Payment Proofs Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 15: CMS Content table
  try {
    const cmsContent = await executeQuery('SELECT COUNT(*) as count FROM cms_content') as any[];
    results.tests.push({
      name: 'CMS Content Table',
      status: 'PASS',
      count: cmsContent[0].count
    });
  } catch (error) {
    results.tests.push({
      name: 'CMS Content Table',
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Summary
  const passCount = results.tests.filter((t: any) => t.status === 'PASS').length;
  const failCount = results.tests.filter((t: any) => t.status === 'FAIL').length;
  
  results.summary = {
    total: results.tests.length,
    passed: passCount,
    failed: failCount,
    success: failCount === 0
  };
  
  return NextResponse.json(results);
}