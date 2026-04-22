// Test script to check homepage update endpoint in production
const PRODUCTION_URL = 'https://oneestela.vercel.app';

async function testHomepageUpdate() {
  console.log('Testing homepage update endpoint...\n');
  
  try {
    // First, check if we can read homepage content
    console.log('1. Testing GET /api/homepage');
    const getResponse = await fetch(`${PRODUCTION_URL}/api/homepage`);
    console.log('Status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('Current data:', JSON.stringify(getData, null, 2));
    
    // Now try to update
    console.log('\n2. Testing POST /api/homepage/update');
    const updateData = {
      heroTitle: 'Test Update - ' + new Date().toISOString()
    };
    
    const updateResponse = await fetch(`${PRODUCTION_URL}/api/homepage/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('Status:', updateResponse.status);
    const updateResult = await updateResponse.json();
    console.log('Response:', JSON.stringify(updateResult, null, 2));
    
    if (updateResponse.status === 500) {
      console.log('\n❌ Update failed with 500 error');
      console.log('Error details:', updateResult);
    } else {
      console.log('\n✅ Update successful');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHomepageUpdate();
