# Venue Reviews Feature

## Overview
Extended the review system to support reviews for both venues and office spaces.

## Changes Made

### Database Migration
Added `venue_id` column to the `reviews` table to allow reviews for venues in addition to office spaces.

**Migration Script:** `scripts/add-venue-to-reviews.sql`
- Added `venue_id INT NULL` column with foreign key to `venues` table
- Made `office_room_id` nullable (since reviews can be for venues OR office spaces)
- Added index on `venue_id` for better query performance

**Run Migration:**
```bash
node scripts/run-add-venue-migration.js
```

### Review Submission Dialog
Updated `components/review-submission-dialog.tsx` to:
- Fetch both venues and office spaces from their respective APIs
- Display all spaces in a single dropdown with labels "(Venue)" or "(Office Space)"
- Use prefixed IDs (`venue_123` or `office_123`) to distinguish between types
- Parse the ID and type when submitting to send correct data to API

### API Updates
Updated `app/api/reviews/route.ts`:

**POST endpoint:**
- Accepts either `officeRoomId` OR `venueId` (not both, not neither)
- Validates that exactly one is provided
- Inserts review with appropriate foreign key

**GET endpoint:**
- Uses LEFT JOIN for both `office_rooms` and `venues` tables
- Returns both `room_name` and `venue_name` fields
- Supports filtering by `venueId` query parameter

### Reviews Context
Updated `components/reviews-context.tsx`:
- Modified `Review` interface to include optional `venue_id` and `venue_name`
- Made `office_room_id` and `room_name` optional
- Updated `submitReview` function signature to accept either `officeRoomId` or `venueId`

### Display Components
Updated review display components to show venue or room name:
- `components/public-reviews-page.tsx` - Shows `venue_name || room_name`
- `app/reviews/page.tsx` - Shows `venue_name || room_name`

## Database Schema

### Reviews Table (Updated)
```sql
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  office_room_id INT NULL,           -- Can be NULL if reviewing a venue
  venue_id INT NULL,                  -- Can be NULL if reviewing an office space
  booking_id INT NULL,
  rating INT NOT NULL,
  title VARCHAR(500),
  review_text LONGTEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
```

## Usage

### Submitting a Review for a Venue
```typescript
await submitReview({
  userId: '1',
  venueId: '5',
  rating: 5,
  title: 'Amazing Venue',
  reviewText: 'Perfect for our wedding!'
})
```

### Submitting a Review for an Office Space
```typescript
await submitReview({
  userId: '1',
  officeRoomId: '12',
  rating: 4,
  title: 'Great Meeting Room',
  reviewText: 'Very professional space'
})
```

### Fetching Reviews
```typescript
// All reviews
const response = await fetch('/api/reviews')

// Reviews for a specific venue
const response = await fetch('/api/reviews?venueId=5')

// Reviews for a specific office space
const response = await fetch('/api/reviews?officeRoomId=12')

// Only approved reviews
const response = await fetch('/api/reviews?approved=true')
```

## Testing

### Test Scripts
- `scripts/check-venues.js` - List all venues and check reviews table structure
- `scripts/test-venue-review.js` - Test inserting and fetching venue reviews
- `scripts/check-office-rooms-structure.js` - Check office_rooms table structure

### Manual Testing
1. Log in as a user
2. Click "Write a Review" button
3. Select a venue from the dropdown (shows "(Venue)" label)
4. Fill in rating and review text
5. Submit review
6. Verify review appears in admin dashboard with correct venue name

## Notes
- Reviews must be approved by admin before appearing publicly
- Users can review any venue or office space, not just ones they've booked
- The dropdown shows all venues and office spaces with clear labels
- Review display automatically shows the correct name (venue or room)
