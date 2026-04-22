// Script to add image_360_url columns to venues and office_rooms tables
const PRODUCTION_URL = 'https://oneestela.vercel.app';

async function addColumns() {
  console.log('Adding image_360_url columns to database...\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/add-360-columns`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('\nFixes applied:');
    data.fixes?.forEach(fix => console.log(fix));
    
    if (data.errors && data.errors.length > 0) {
      console.log('\nErrors:');
      data.errors.forEach(error => console.log(error));
    }
    
    if (data.success) {
      console.log('\n✅ SUCCESS! 360° image columns have been added');
      console.log('You can now save venues and office rooms with 360° images.');
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
    
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

addColumns();
