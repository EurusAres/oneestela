# CMS Image Upload Fix

## Problem Identified
The CMS homepage editor was failing with error:
```
Error: Data too long for column 'hero_image' at row 1
```

## Root Cause
The `hero_image` column in the `homepage_content` table was defined as `VARCHAR(500)`, which is too small to store base64-encoded images. Base64 images can easily be 50KB-500KB or more in size.

## Solution
Change the `hero_image` column from `VARCHAR(500)` to `LONGTEXT` to support large base64-encoded images.

## How to Apply the Fix

### Option 1: Using the API Endpoint (Recommended)
Once the deployment completes, run this command:

```bash
node scripts/run-hero-image-fix.js
```

Or visit this URL in your browser:
```
https://oneestela.vercel.app/api/fix-hero-image
```

### Option 2: Using MySQL Workbench
1. Connect to your Aiven MySQL database
2. Run this SQL command:
```sql
USE one_estela_place;
ALTER TABLE homepage_content MODIFY COLUMN hero_image LONGTEXT;
```

## Verification
After applying the fix, you should be able to:
1. Go to the CMS dashboard (https://oneestela.vercel.app/dashboard/cms)
2. Click "Upload Image" under "Head Image"
3. Select an image file
4. The image should upload successfully without errors
5. You should see a success toast notification

## Additional Notes
- This fix only needs to be run once
- The fix is safe and won't affect existing data
- After the fix, images will be stored as base64 data URLs in the database
- Maximum image size is now limited only by MySQL's LONGTEXT limit (4GB)
- For production, consider using a CDN or cloud storage service (like AWS S3, Cloudinary) instead of base64 storage for better performance

## Related Files
- Fix endpoint: `app/api/fix-hero-image/route.ts`
- SQL script: `scripts/fix-hero-image-column.sql`
- Test script: `scripts/run-hero-image-fix.js`
