# Review Submission Fix

## Problem
Users were getting "Submission Failed" error when trying to submit reviews.

## Root Cause
The `ReviewSubmissionDialog` component was defaulting to `officeRoomId: '1'` when no room ID was provided. However, office room with ID 1 doesn't exist in the database (current rooms have IDs 12 and 14). This caused a foreign key constraint violation when trying to insert the review.

## Solution
Updated `components/review-submission-dialog.tsx` to:

1. **Fetch available office rooms** when the dialog opens
2. **Display a dropdown** allowing users to select which space they want to review
3. **Auto-select the first available room** if no specific room is provided
4. **Validate** that a room is selected before submission
5. **Disable the dropdown** if reviewing a specific booking (officeRoomId is provided)

## Changes Made

### Added Features:
- Space/Venue dropdown selector in the review form
- Automatic fetching of available office rooms from `/api/office-rooms`
- Auto-selection of first available room as default
- Validation to ensure a space is selected before submission

### Technical Changes:
- Added `useEffect` hook to fetch office rooms when dialog opens
- Added state for `selectedRoomId` and `officeRooms`
- Added `Select` component from shadcn/ui for room selection
- Updated submit handler to use `selectedRoomId` instead of hardcoded default

## Testing

### Manual Testing:
1. Log in as a user
2. Click the "Write a Review" button (star icon in bottom right)
3. Select a space from the dropdown
4. Fill in rating and review text
5. Submit the review
6. Verify success message appears

### Database Verification:
```bash
node scripts/check-office-rooms.js  # Check available rooms
node scripts/test-review-submission.js  # Test direct database insertion
```

### API Testing:
```bash
# Start the dev server first
npm run dev

# In another terminal:
node scripts/test-review-api.js  # Test the API endpoint
```

## Files Modified
- `components/review-submission-dialog.tsx` - Added room selection dropdown and validation

## Files Created
- `scripts/check-reviews-table.js` - Verify reviews table exists
- `scripts/test-review-submission.js` - Test direct database insertion
- `scripts/check-office-rooms.js` - List available office rooms
- `scripts/test-review-api.js` - Test the API endpoint
- `REVIEW_SUBMISSION_FIX.md` - This documentation

## Notes
- Reviews are submitted with `is_approved: false` by default
- Admin must approve reviews before they appear publicly
- Users can review any space, not just ones they've booked
- If reviewing from a booking, the space is pre-selected and locked
