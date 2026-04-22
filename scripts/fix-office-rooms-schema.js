// Script to add missing columns to office_rooms table
const PRODUCTION_URL = 'https://oneestela.vercel.app';

async function fixSchema() {
  console.log('Fixing office_rooms table schema...\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/fix-office-rooms-schema`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('\nFixes applied:');
    data.fixes?.forEach(fix => console.log(fix));
    
    if (data.errors && data.errors.length > 0) {
      console.log('\nErrors:');
      data.errors.forEach(error => console.log(error));
    }
    
    if (data.success) {
      console.log('\n✅ SUCCESS! office_rooms table schema has been fixed');
      console.log('You can now create and edit office rooms.');
    } else {
      console.log('\n❌ Some fixes failed. Check errors above.');
    }
    
  } catch (error) {
    console.error('Error running fix:', error);
  }
}

fixSchema();
