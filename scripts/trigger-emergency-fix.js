// Script to trigger the emergency database fix
const https = require('https');

const postData = JSON.stringify({});

const options = {
  hostname: 'oneestela.vercel.app',
  port: 443,
  path: '/api/test-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚨 Triggering Emergency Database Fix...');
console.log('URL: https://oneestela.vercel.app/api/test-db');

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
      
      if (response.success) {
        console.log('\n✅ Emergency fix completed successfully!');
        console.log(`📊 Fixes applied: ${response.fixes?.length || 0}`);
        console.log(`❌ Errors encountered: ${response.errors?.length || 0}`);
        
        if (response.fixes) {
          console.log('\n✅ Successful fixes:');
          response.fixes.forEach(fix => console.log(`  ${fix}`));
        }
        
        if (response.errors && response.errors.length > 0) {
          console.log('\n❌ Errors:');
          response.errors.forEach(error => console.log(`  ${error}`));
        }
      } else {
        console.log('\n❌ Emergency fix failed!');
        console.log('Error:', response.error);
        console.log('Details:', response.details);
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