// Detailed test to see the exact error from CMS update
const PRODUCTION_URL = 'https://oneestela.vercel.app';

async function testDetailedUpdate() {
  console.log('Testing CMS homepage update with detailed error logging...\n');
  
  try {
    // Test with the exact same data the CMS would send
    const testData = {
      heroTitle: 'Updated Title Test'
    };
    
    console.log('Sending update:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${PRODUCTION_URL}/api/homepage/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\nRaw response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testDetailedUpdate();
