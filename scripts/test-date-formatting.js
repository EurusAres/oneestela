// Test script to verify date formatting logic
// Run with: node scripts/test-date-formatting.js

console.log('=== Date Formatting Test ===\n');

// Simulate current date (April 22, 2026)
const currentDate = new Date('2026-04-22T10:00:00');
console.log('Current Date:', currentDate.toISOString());
console.log('Current Date (Local):', currentDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
console.log('');

// Test 1: Format date for database (YYYY-MM-DD)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const testDate1 = new Date('2026-05-22');
console.log('Test 1: Selected date for event booking');
console.log('Input:', testDate1);
console.log('Formatted for DB:', formatLocalDate(testDate1));
console.log('Display format:', testDate1.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
console.log('');

// Test 2: Office inquiry placeholder (current date)
console.log('Test 2: Office inquiry placeholder');
const now = new Date();
const currentDateStr = now.toISOString().split('T')[0];
console.log('Current date string:', currentDateStr);
console.log('Check-in datetime:', `${currentDateStr} 09:00:00`);
console.log('Check-out datetime:', `${currentDateStr} 17:00:00`);
console.log('');

// Test 3: Parse date from database
console.log('Test 3: Parse date from database');
const dbDate = '2026-05-22';
const parsedDate = new Date(dbDate);
console.log('DB value:', dbDate);
console.log('Parsed date:', parsedDate);
console.log('Display format:', parsedDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
console.log('');

// Test 4: Old placeholder date (should be updated)
console.log('Test 4: Old placeholder date (needs migration)');
const oldPlaceholder = '2024-01-01';
const oldDate = new Date(oldPlaceholder);
console.log('Old placeholder:', oldPlaceholder);
console.log('Display format:', oldDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
console.log('⚠️ This should be updated to current date for office inquiries');
console.log('');

// Test 5: Date with time from database
console.log('Test 5: Date with time from database');
const dbDateTime = '2026-05-22T14:30:00';
const dateTime = new Date(dbDateTime);
console.log('DB value:', dbDateTime);
console.log('Date only:', dbDateTime.split('T')[0]);
console.log('Time only:', dateTime.toTimeString().slice(0, 5));
console.log('Display format:', dateTime.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));
console.log('');

console.log('=== Test Complete ===');
