// Test script to verify new homepage update endpoint
const https = require('https');

const testData = {
  heroTitle: 'Updated - One Estela Place',
  heroDescription: 'Testing the new homepage update endpoint'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'oneestela.vercel.app',
  port: 443,
  path: '/api/homepage/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing New Homepage Update Endpoint...');
console.log('URL: https://oneestela.vercel.app/api/homepage/update');
console.log('Method: POST');
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
        
        // Test if the update worked by fetching the homepage
        setTimeout(() => {
          console.log('\n🔍 Verifying update by fetching homepage...');
          const getOptions = {
            hostname: 'oneestela.vercel.app',
            port: 443,
            path: '/api/homepage',
            method: 'GET'
          };
          
          const getReq = https.request(getOptions, (getRes) => {
            let getData = '';
            getRes.on('data', (chunk) => {
              getData += chunk;
            });
            
            getRes.on('end', () => {
              try {
                const getResponse = JSON.parse(getData);
                console.log('Updated content:', {
                  heroTitle: getResponse.heroTitle,
                  heroDescription: getResponse.heroDescription
                });
                
                if (getResponse.heroTitle === testData.heroTitle) {
                  console.log('✅ Update verified successfully!');
                } else {
                  console.log('❌ Update not reflected in GET response');
                }
              } catch (error) {
                console.log('Error parsing GET response:', error.message);
              }
            });
          });
          
          getReq.end();
        }, 2000);
        
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