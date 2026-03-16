# Remove Dummy Client Data - Instructions

This guide will help you remove all dummy/test client data from your One Estela Place database.

## What Will Be Removed

- All test bookings (John Doe, Jane Smith, etc.)
- All dummy users except the admin account
- All chat messages
- All contact messages
- All payment proofs
- All reviews

## What Will Be Kept

- Admin user account (admin@oneestela.com)
- All office rooms
- All venue information
- CMS content
- Staff accounts (if any)
- Database structure

## How to Execute the Cleanup

### Option 1: Using phpMyAdmin (Recommended for XAMPP users)

1. Open phpMyAdmin in your browser: `http://localhost/phpmyadmin`
2. Select the `one_estela_place` database from the left sidebar
3. Click on the "SQL" tab at the top
4. Open the file `remove_dummy_data.sql` in a text editor
5. Copy all the SQL commands
6. Paste them into the SQL query box in phpMyAdmin
7. Click "Go" to execute
8. Check the results at the bottom to verify the cleanup

### Option 2: Using MySQL Command Line

```bash
# Navigate to your project directory
cd C:\nani\kiro\oneestela

# Execute the SQL script
mysql -u root -p one_estela_place < remove_dummy_data.sql

# Enter your MySQL password when prompted
```

### Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open the `remove_dummy_data.sql` file
4. Click the lightning bolt icon to execute
5. Review the results

## After Cleanup

Once the cleanup is complete:

1. Refresh your admin dashboard at `http://localhost:3000/dashboard`
2. You should see:
   - Total Bookings: 0
   - Total Revenue: ₱0
   - Monthly Bookings: 0
   - Monthly Revenue: ₱0
   - Recent Bookings: "No customer bookings found"

3. The dashboard is now ready for real customer data!

## Verification

After running the script, you can verify the cleanup by running these queries:

```sql
-- Check remaining users (should only show admin)
SELECT id, email, full_name, role FROM users;

-- Check bookings count (should be 0)
SELECT COUNT(*) FROM bookings;

-- Check chat messages count (should be 0)
SELECT COUNT(*) FROM chat_messages;

-- Check contact messages count (should be 0)
SELECT COUNT(*) FROM contact_messages;
```

## Important Notes

- **Backup First**: Although this only removes test data, it's always good practice to backup your database before running cleanup scripts
- **Cannot Undo**: Once executed, this action cannot be undone without restoring from a backup
- **Admin Account**: Your admin account will remain intact and you can continue logging in with the same credentials

## Need Help?

If you encounter any issues:
1. Check that MySQL/XAMPP is running
2. Verify you have the correct database name (`one_estela_place`)
3. Ensure you have proper permissions to delete data
4. Check the MySQL error log for specific error messages
