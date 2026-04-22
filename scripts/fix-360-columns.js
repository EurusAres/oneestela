// Script to fix image_360_url and image_url columns to support base64 images
const PRODUCTION_URL = 'https://oneestela.vercel.app';

async function fixColumns() {
  console.log('Fixing image columns to support base64 images...\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/fix-360-columns`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('\nFixes applied:');
    data.fixes?.forEach(fix => console.log(fix));
    
    if (data.errors && data.errors.length > 0) {
      console.log('\nErrors:');
      data.errors.forEach(error => console.log(error));
    }
    
    if (data.success) {
      console.log('\n✅ SUCCESS! All image columns have been updated to LONGTEXT');
      console.log('You can now upload images without size restrictions.');
    } else {
      console.log('\n❌ Some fixes failed. Check errors above.');
    }
    
  } catch (error) {
    console.error('Error running fix:', error);
  }
}

fixColumns();
