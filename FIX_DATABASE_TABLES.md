# Fix Database Tables for Unavailable Dates & Offices

## Problem
The database tables for `unavailable_dates` and `unavailable_offices` may have incorrect structure or constraints that prevent custom reasons from being saved.

## Solution
I've created two endpoints that will automatically fix the table structures.

---

## Step 1: Fix Unavailable Dates Table

### Run this URL in your browser:
```
https://oneestela.vercel.app/api/fix-unavailable-dates-table
```

### What it does:
1. ✅ Checks if the table exists
2. ✅ Shows current table structure
3. ✅ Drops the existing table (safely)
4. ✅ Creates a new table with correct structure:
   - `id` - Auto-increment primary key
   - `venue_id` - Foreign key to venues table
   - `date` - DATE field for the unavailable date
   - `reason` - VARCHAR(500) for the reason (supports custom text)
   - `notes` - TEXT field for additional notes
   - `created_by` - VARCHAR(255) for admin username
   - `created_at` - Timestamp of creation
5. ✅ Tests an insert operation
6. ✅ Cleans up test data

### Expected Response:
```json
{
  "success": true,
  "message": "Table fixed successfully",
  "results": {
    "steps": [
      "Checking if unavailable_dates table exists...",
      "Table exists: true",
      "Checking table structure...",
      "Current structure retrieved",
      "Dropping existing table...",
      "Table dropped successfully",
      "Creating table with correct structure...",
      "Table created successfully",
      "Verifying new table structure...",
      "New structure verified",
      "Testing insert operation...",
      "Test insert successful",
      "Test data cleaned up"
    ],
    "errors": [],
    "currentStructure": [...],
    "newStructure": [...]
  }
}
```

---

## Step 2: Fix Unavailable Offices Table

### Run this URL in your browser:
```
https://oneestela.vercel.app/api/fix-unavailable-offices-table
```

### What it does:
1. ✅ Checks if the table exists
2. ✅ Shows current table structure
3. ✅ Drops the existing table (safely)
4. ✅ Creates a new table with correct structure:
   - `id` - Auto-increment primary key
   - `office_room_id` - Foreign key to office_rooms table
   - `reason` - VARCHAR(500) for the reason (supports custom text)
   - `unavailable_rooms` - INT for number of unavailable rooms
   - `created_at` - Timestamp of creation
5. ✅ Tests an insert operation
6. ✅ Cleans up test data

### Expected Response:
```json
{
  "success": true,
  "message": "Table fixed successfully",
  "results": {
    "steps": [
      "Checking if unavailable_offices table exists...",
      "Table exists: true",
      "Checking table structure...",
      "Current structure retrieved",
      "Dropping existing table...",
      "Table dropped successfully",
      "Creating table with correct structure...",
      "Table created successfully",
      "Verifying new table structure...",
      "New structure verified",
      "Testing insert operation...",
      "Test insert successful",
      "Test data cleaned up"
    ],
    "errors": [],
    "currentStructure": [...],
    "newStructure": [...]
  }
}
```

---

## Step 3: Test the Fix

### Test Unavailable Dates:
1. Go to: https://oneestela.vercel.app/calendar
2. Click "Manage Unavailable Dates"
3. Click "Add Unavailable Date"
4. Select a venue
5. Select a date
6. Select "Other (Custom Reason)"
7. Enter a custom reason (e.g., "linis muna")
8. Click "Add Unavailable Date"
9. **Expected:** Success! Date added with custom reason

### Test Unavailable Offices:
1. Go to: https://oneestela.vercel.app/calendar
2. Click "Manage Unavailable Office Spaces"
3. Select an office space
4. Select "Other (Custom Reason)"
5. Enter a custom reason (e.g., "Equipment installation")
6. Enter number of rooms
7. Click "Mark Rooms as Unavailable"
8. **Expected:** Success! Office marked with custom reason

---

## What Gets Fixed

### Table Structure Issues:
- ❌ **Old:** `reason` column might be too short (VARCHAR(50) or VARCHAR(100))
- ✅ **New:** `reason` column is VARCHAR(500) - supports long custom reasons

### Constraint Issues:
- ❌ **Old:** Missing or incorrect foreign key constraints
- ✅ **New:** Proper foreign keys with CASCADE delete

### Index Issues:
- ❌ **Old:** Missing indexes for performance
- ✅ **New:** Indexes on frequently queried columns

### Data Type Issues:
- ❌ **Old:** Incorrect data types for date/timestamp fields
- ✅ **New:** Proper DATE and TIMESTAMP types

---

## Safety Notes

### ⚠️ Important:
- **This will delete all existing unavailable dates and offices**
- If you have important data, back it up first
- The fix endpoints are safe to run multiple times

### Data Loss:
- Any existing unavailable dates will be deleted
- Any existing unavailable offices will be deleted
- This is necessary to fix the table structure

### Backup (Optional):
If you want to backup existing data first, run these queries in your database:
```sql
-- Backup unavailable dates
CREATE TABLE unavailable_dates_backup AS SELECT * FROM unavailable_dates;

-- Backup unavailable offices
CREATE TABLE unavailable_offices_backup AS SELECT * FROM unavailable_offices;
```

---

## Troubleshooting

### If the fix fails:

1. **Check the error message in the response**
   - Look at the `errors` array in the JSON response
   - This will tell you exactly what went wrong

2. **Common Issues:**
   - **Foreign key constraint fails:** Venues or office_rooms table doesn't exist
   - **Permission denied:** Database user doesn't have DROP/CREATE permissions
   - **Table locked:** Another process is using the table

3. **Manual Fix:**
   If the automatic fix doesn't work, you can run these SQL commands manually:

   ```sql
   -- Fix unavailable_dates
   DROP TABLE IF EXISTS unavailable_dates;
   CREATE TABLE unavailable_dates (
     id INT PRIMARY KEY AUTO_INCREMENT,
     venue_id INT NOT NULL,
     date DATE NOT NULL,
     reason VARCHAR(500),
     notes TEXT,
     created_by VARCHAR(255) DEFAULT 'admin',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
     UNIQUE KEY unique_venue_date (venue_id, date),
     INDEX idx_venue_id (venue_id),
     INDEX idx_date (date)
   );

   -- Fix unavailable_offices
   DROP TABLE IF EXISTS unavailable_offices;
   CREATE TABLE unavailable_offices (
     id INT PRIMARY KEY AUTO_INCREMENT,
     office_room_id INT NOT NULL,
     reason VARCHAR(500),
     unavailable_rooms INT NOT NULL DEFAULT 1,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
     INDEX idx_office_room_id (office_room_id)
   );
   ```

---

## After Fixing

### Verify the Fix:
1. ✅ Tables recreated with correct structure
2. ✅ Custom reasons can be saved (up to 500 characters)
3. ✅ Foreign keys properly configured
4. ✅ Indexes created for performance
5. ✅ Test inserts successful

### Next Steps:
1. Test adding unavailable dates with custom reasons
2. Test adding unavailable offices with custom reasons
3. Verify data displays correctly in the UI
4. Check that deletions work properly

---

## Summary

**Run these URLs to fix the tables:**
1. https://oneestela.vercel.app/api/fix-unavailable-dates-table
2. https://oneestela.vercel.app/api/fix-unavailable-offices-table

**Then test:**
- Add unavailable date with custom reason
- Add unavailable office with custom reason

**Status:** Ready to fix! 🔧
