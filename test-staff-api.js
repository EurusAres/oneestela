async function testStaffAPI() {
  try {
    console.log('Testing POST /api/staff...');
    
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      position: 'Test Position',
      department: 'Test Department',
      hireDate: '2024-01-01',
      salary: '50000'
    };

    console.log('Sending data:', testData);

    const response = await fetch('http://localhost:3000/api/staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✓ Staff member created successfully');
    } else {
      console.error('✗ Failed to create staff member');
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testStaffAPI();
