// Test script to check if PUT methods work on other endpoints
const https = require('https');

async function testPutEndpoint(path, data = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'oneestela.vercel.app',
      port: 443,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 Testing PUT ${path}...`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 405) {
          console.log('❌ Method Not Allowed');
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ PUT method works');
        } else {
          console.log(`⚠️ Status ${res.statusCode}: ${data.substring(0, 100)}`);
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing PUT endpoints...');
  
  // Test homepage (known to fail)
  await testPutEndpoint('/api/homepage', { heroTitle: 'Test' });
  
  // Test payment-proofs (should work or give different error)
  await testPutEndpoint('/api/payment-proofs?id=1', { status: 'verified' });
  
  // Test contact (should work or give different error)  
  await testPutEndpoint('/api/contact?id=1', { status: 'read' });
  
  console.log('\n✅ PUT endpoint tests completed');
}

runTests().catch(console.error);