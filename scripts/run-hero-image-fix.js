// Script to run the hero_image column fix in production
const PRODUCTION_URL = 'https://oneestela.vercel.app';

async function runFix() {
  console.log('Running hero_image column fix...\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/fix-hero-image`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! The hero_image column has been updated to LONGTEXT');
      console.log('You can now upload images in the CMS without errors.');
    } else {
      console.log('\n❌ FAILED:', data.error);
      console.log('Details:', data.details);
    }
    
  } catch (error) {
    console.error('Error running fix:', error);
  }
}

runFix();
