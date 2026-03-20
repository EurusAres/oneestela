// Test the office rooms API endpoint
async function testOfficeRoomsAPI() {
  console.log('Testing Office Rooms API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/office-rooms?includeAll=true');
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS!');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.rooms && data.rooms.length > 0) {
        console.log(`\nFound ${data.rooms.length} rooms:`);
        data.rooms.forEach(room => {
          console.log(`  - ID: ${room.id}, Name: ${room.name}`);
        });
      } else {
        console.log('\n⚠️ No rooms found in response');
      }
    } else {
      console.log('\n❌ FAILED!');
      const error = await response.json();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

console.log('Make sure the Next.js dev server is running on http://localhost:3000\n');
testOfficeRoomsAPI();
