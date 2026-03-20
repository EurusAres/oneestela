// Test script to verify review submission API
// This simulates what the frontend does

async function testReviewAPI() {
  console.log('Testing Review Submission API...\n');
  
  // Test data - using actual IDs from database
  const testReview = {
    userId: 1, // Admin user
    officeRoomId: 12, // "testing" room
    rating: 5,
    title: 'Test Review from API',
    reviewText: 'This is a test review to verify the API works correctly.'
  };
  
  console.log('Sending POST request to /api/reviews');
  console.log('Data:', JSON.stringify(testReview, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testReview),
    });
    
    console.log('\nResponse status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Review submitted successfully');
      console.log('Review ID:', data.reviewId);
    } else {
      console.log('\n❌ FAILED! Error:', data.error);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Note: This requires the Next.js dev server to be running
console.log('Make sure the Next.js dev server is running on http://localhost:3000\n');
testReviewAPI();
