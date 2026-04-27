# Calendar Reserved Dates Debug Guide

## Issue
The red marking on the event calendar is not showing for reserved dates.

## Debug Logging Added
I've added console logging to help diagnose the issue. The logs will show:
1. How each booking date is being parsed
2. How admin unavailable dates are being parsed
3. The total number of reserved dates
4. The actual date strings being used

## How to Check the Logs

### Step 1: Open the Website
1. Go to: https://oneestela.vercel.app
2. Wait for deployment to complete (~2 minutes)

### Step 2: Open Browser Console
1. Press **F12** to open Developer Tools
2. Click on the **Console** tab

### Step 3: Open the Booking Dialog
1. Click "Book Your Event" or "Reserve Now" button
2. The reserve dialog will open

### Step 4: Check the Console Logs
Look for these log messages:

```
Parsing booking date: {
  bookingId: 1,
  status: "pending",
  rawDate: "2026-05-22",
  rawCheckIn: "2026-05-22T14:00:00",
  dateStr: "2026-05-22",
  parsedDate: "Thu May 22 2026"
}

Total reserved dates from bookings: 1 ["Thu May 22 2026"]

Parsing admin unavailable date: {
  id: 1,
  rawDate: "2026-05-15",
  parsedDate: "Fri May 15 2026"
}

Total admin unavailable dates: 1 ["Fri May 15 2026"]

All reserved dates combined: 2 ["Thu May 22 2026", "Fri May 15 2026"]
```

## What to Look For

### ✅ Good Signs:
- Bookings are being fetched (you see "Parsing booking date" logs)
- Dates are being parsed correctly (parsedDate shows a valid date)
- Total reserved dates > 0
- The dates match actual bookings in the database

### ❌ Problem Signs:
- No "Parsing booking date" logs = No bookings found
- `rawDate: undefined` or `dateStr: ""` = Date field is missing
- `parsedDate: "Invalid Date"` = Date parsing failed
- Total reserved dates: 0 = No dates to mark

## Common Issues and Solutions

### Issue 1: No Bookings Found
**Symptoms:** No "Parsing booking date" logs
**Cause:** No confirmed or pending bookings in database
**Solution:** Create a test booking first

### Issue 2: Date Field Missing
**Symptoms:** `rawDate: undefined` or `dateStr: ""`
**Cause:** Booking doesn't have `date` or `check_in_date` field
**Solution:** Check database schema and ensure dates are being saved

### Issue 3: Wrong Date Format
**Symptoms:** `parsedDate: "Invalid Date"`
**Cause:** Date string is not in YYYY-MM-DD format
**Solution:** Fix date formatting in booking creation

### Issue 4: Dates Not Matching
**Symptoms:** Dates in logs don't match calendar
**Cause:** Timezone conversion issue
**Solution:** Ensure dates are stored and parsed in local timezone

## Testing Steps

### Create a Test Booking:
1. Login as customer: eares223321@gmail.com / nelu123
2. Click "Reserve Now"
3. Select a venue (not office)
4. Fill in details
5. Select a date (e.g., May 25, 2026)
6. Select times
7. Submit booking

### Check if Date is Marked:
1. Logout or open incognito window
2. Click "Reserve Now" again
3. Open browser console (F12)
4. Check the logs
5. Look at the calendar - the date you selected should be red

## Expected Behavior

When working correctly:
- Reserved dates appear with **red background**
- Reserved dates have **white text**
- Reserved dates have **line-through** styling
- Hovering shows darker red
- Clicking shows unavailable message

## Next Steps

After checking the logs, report back with:
1. Screenshot of console logs
2. Screenshot of calendar
3. Any error messages
4. Whether you see any "Parsing booking date" logs

This will help identify the exact issue and fix it.
