// Test script to verify homepage PUT endpoint
const https = require('https');

const testData = {
  heroTitle: 'Test Update - One Estela Place',
  heroDescription: 'Testing the homepage update functionality'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'oneestela.vercel.app',
  port: 443,
  path: '/api/homepage',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Homepage PUT Endpoint...');
console.log('URL: https://oneestela.vercel.app/api/homepage');
console.log('Method: PUT');
console.log('Data:', testData);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📋 Response:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ Homepage update successful!');
      } else {
        console.log('\n❌ Homepage update failed!');
        console.log('Status:', res.statusCode);
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();