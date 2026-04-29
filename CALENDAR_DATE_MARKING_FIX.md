# Calendar Date Marking Fix

## Issue
The calendar was not consistently marking all booked dates as red/reserved. Specifically:
- April 28, 2026 booking was showing correctly (red)
- May 29, 2026 booking was NOT showing as red (BUG)

## Root Cause
The issue was with date normalization and comparison. The Date objects being passed to the Calendar component had inconsistent time components, which caused the react-day-picker library's internal date matching to fail for some dates.

## Solution
Implemented a `normalizeDate` helper function that:
1. Parses date strings consistently (handles both "YYYY-MM-DD" format and other formats)
2. Normalizes ALL dates to midnight local time (0:00:00.000)
3. Ensures consistent timestamp comparison

### Changes Made

**File: `app/calendar/page.tsx`**

1. Added `normalizeDate` helper function:
```typescript
const normalizeDate = (dateStr: string): Date => {
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number)
    // Create date at midnight local time
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  }
  // Parse and normalize to midnight
  const date = new Date(dateStr)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}
```

2. Updated date extraction for bookings:
```typescript
const reservedDates = reservedBookings.map((booking) => {
  const dateStr = booking.date
  const normalizedDate = normalizeDate(dateStr)
  return normalizedDate
})
```

3. Updated date extraction for admin unavailable dates:
```typescript
const adminReservedDates = adminUnavailableDates.map((unavailable) => {
  return normalizeDate(unavailable.date)
})
```

4. Updated date comparison for selected date filtering:
```typescript
const bookingsForSelectedDate = date
  ? reservedBookings.filter((booking) => {
      const bookingDate = normalizeDate(booking.date)
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
      return bookingDate.getTime() === selectedDate.getTime()
    })
  : []
```

## Testing
After deployment, verify:
1. Navigate to the calendar page
2. Check that April 28, 2026 shows as red (confirmed/pending booking)
3. Check that May 29, 2026 shows as red (confirmed/pending booking)
4. Both dates should now be consistently marked as reserved

## Deployment
- Committed: `7d0cc89` - "Fix calendar date marking by normalizing dates to midnight local time"
- Pushed to GitHub: main branch
- Vercel will automatically deploy the changes

## Debug Logging
Enhanced console logging is included to track:
- Date parsing and normalization
- Timestamp values
- Time components (hours, minutes)
- Combined reserved dates array

Check browser console for detailed date processing information.
