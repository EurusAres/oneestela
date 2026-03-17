# CMS Setup Guide - Database Migration Required

## Issue
The CMS and Virtual Tour features require additional database columns that may not exist in your current database schema.

## Error Symptoms
- 500 Internal Server Error when accessing `/dashboard/cms`
- Console errors: "Failed to load resource: the server responded with a status of 404"
- API errors mentioning "Unknown column 'image_360_url'" or "Unknown column 'type'"

## Solution: Run Database Migration

### Step 1: Connect to Your Database

Using MySQL command line:
```bash
mysql -u root -p one_estela_place
```

Or using phpMyAdmin, MySQL Workbench, or any MySQL client.

### Step 2: Run the Migration Script

Execute the SQL commands from `add_cms_columns.sql`:

```sql
-- Add image_360_url column to venues table if it doesn't exist
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS image_360_url VARCHAR(500) DEFAULT '';

-- Add image_360_url and type columns to office_rooms table if they don't exist
ALTER TABLE office_rooms 
ADD COLUMN IF NOT EXISTS image_360_url VARCHAR(500) DEFAULT '',
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'office';

-- Update existing records to have default type
UPDATE office_rooms SET type = 'office' WHERE type IS NULL OR type = '';
```

### Step 3: Verify the Changes

Check that the columns were added:

```sql
-- Check venues table structure
DESCRIBE venues;

-- Check office_rooms table structure
DESCRIBE office_rooms;
```

You should see:
- `venues` table: `image_360_url` column (VARCHAR 500)
- `office_rooms` table: `image_360_url` column (VARCHAR 500) and `type` column (VARCHAR 50)

### Step 4: Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Test the CMS

1. Navigate to `/dashboard/cms`
2. Try adding a new venue or office space
3. The form should now work without errors
4. Check the virtual tour to see your new content

## Alternative: Manual Column Addition

If the migration script doesn't work, add columns manually:

### For venues table:
```sql
ALTER TABLE venues ADD COLUMN image_360_url VARCHAR(500) DEFAULT '';
```

### For office_rooms table:
```sql
ALTER TABLE office_rooms ADD COLUMN image_360_url VARCHAR(500) DEFAULT '';
ALTER TABLE office_rooms ADD COLUMN type VARCHAR(50) DEFAULT 'office';
UPDATE office_rooms SET type = 'office' WHERE type IS NULL OR type = '';
```

## What These Columns Do

### `image_360_url` (both tables)
- Stores the URL for 360° panoramic images
- Used in the virtual tour for immersive viewing experience
- Optional - regular images still work without it

### `type` (office_rooms only)
- Categorizes office spaces: 'office', 'meeting', 'conference', 'event'
- Helps organize and filter spaces in the CMS
- Defaults to 'office' for existing records

## Fallback Behavior

The API has been updated to handle missing columns gracefully:
- If columns don't exist, it will work with basic functionality
- You'll see a warning message when creating new entries
- 360° images won't be saved until migration is complete
- Virtual tour will still work with regular images

## Troubleshooting

### Error: "Table 'venues' doesn't exist"
Your database might not have the venues table. Check your database setup.

### Error: "Access denied"
Make sure you're using the correct database credentials in your `.env` file.

### Error: "Column already exists"
The columns are already added - you're good to go!

### CMS still shows errors
1. Clear your browser cache
2. Restart the development server
3. Check browser console for specific error messages
4. Verify database connection in `.env` file

## Database Schema Reference

### Complete venues table structure:
```sql
CREATE TABLE IF NOT EXISTS venues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  capacity INT,
  price_per_hour DECIMAL(10, 2),
  image_url VARCHAR(500),
  image_360_url VARCHAR(500) DEFAULT '',
  amenities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Complete office_rooms table structure:
```sql
CREATE TABLE IF NOT EXISTS office_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT,
  price_per_hour DECIMAL(10, 2),
  image_url VARCHAR(500),
  image_360_url VARCHAR(500) DEFAULT '',
  amenities TEXT,
  type VARCHAR(50) DEFAULT 'office',
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL
);
```

## Next Steps After Migration

1. **Add Sample Content**: Go to CMS and add a few venues and office spaces
2. **Test Virtual Tour**: Click "Take a Tour" button on homepage
3. **Upload 360° Images**: Use 360° panoramic images for immersive experience
4. **Configure Amenities**: Add relevant amenities for each space

## Support

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Check the server terminal for API error logs
3. Verify all database tables exist and have correct structure
4. Ensure `.env` file has correct database credentials
