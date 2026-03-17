# Customer Review System Documentation

## Overview
A complete customer review system that allows customers to submit reviews and enables admins/staff to manage them in real-time. Reviews are displayed on the homepage and a dedicated public reviews page.

## Features Implemented

### 1. Customer Review Submission
- **Review Dialog Component** - Easy-to-use form for submitting reviews
- **Star Rating System** - Interactive 5-star rating selector
- **Review Title** - Optional title field (max 100 characters)
- **Review Text** - Required review content (max 1000 characters)
- **Character Counters** - Real-time character count display
- **Review Guidelines** - Built-in guidelines for customers
- **Authentication Check** - Requires user login to submit
- **Booking Integration** - Can link reviews to specific bookings

### 2. Admin Review Management
- **Real-time Dashboard** - Auto-refreshes every 30 seconds
- **Statistics Cards** - Total, Pending, Approved, Featured, Average Rating
- **Tabbed Interface** - Filter by All, Pending, Approved, Featured
- **Approve Reviews** - One-click approval for pending reviews
- **Feature Reviews** - Highlight best reviews on homepage
- **Delete Reviews** - Remove inappropriate or spam reviews
- **Confirmation Dialogs** - Prevent accidental deletions
- **Review Details** - Full customer info, rating, date, room name

### 3. Public Display
- **Homepage Featured Reviews** - Shows up to 3 featured/approved reviews
- **Dedicated Reviews Page** - `/customer-reviews` route
- **Statistics Display** - Total reviews and average rating
- **Responsive Grid Layout** - 3-column layout on desktop
- **Featured Badges** - Visual indicator for featured reviews
- **Loading States** - Skeleton loaders during data fetch
- **Empty States** - Encouraging messages when no reviews exist
- **Call-to-Action** - Booking prompts on reviews page

### 4. Real-time Updates
- **Auto-refresh** - Reviews context refreshes every 30 seconds
- **Instant Updates** - Changes reflect immediately after actions
- **Event-driven** - Context updates trigger UI re-renders
- **Optimistic UI** - Smooth user experience during updates

## Technical Implementation

### Database Schema

```sql
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  office_room_id INT NOT NULL,
  booking_id INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NULL,
  review_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
```

### API Endpoints

#### GET `/api/reviews`
Fetch reviews with optional filtering.

**Query Parameters:**
- `officeRoomId` - Filter by specific room
- `approved` - Filter by approval status (true/false)

**Response:**
```json
{
  "reviews": [
    {
      "id": "1",
      "user_id": "2",
      "office_room_id": "1",
      "booking_id": null,
      "rating": 5,
      "title": "Perfect Wedding Venue",
      "review_text": "Amazing experience...",
      "is_approved": true,
      "is_featured": true,
      "created_at": "2025-03-17T10:00:00Z",
      "updated_at": "2025-03-17T10:00:00Z",
      "full_name": "John Doe",
      "room_name": "Main Hall"
    }
  ]
}
```

#### POST `/api/reviews`
Submit a new review.

**Request Body:**
```json
{
  "userId": "2",
  "officeRoomId": "1",
  "bookingId": "12",
  "rating": 5,
  "title": "Great Experience",
  "reviewText": "Had an amazing time..."
}
```

**Response:**
```json
{
  "message": "Review submitted successfully",
  "reviewId": 15
}
```

#### PATCH `/api/reviews`
Update review status (approve/feature).

**Request Body:**
```json
{
  "reviewId": "15",
  "action": "approve" // or "unapprove", "feature", "unfeature"
}
```

**Response:**
```json
{
  "message": "Review approved successfully"
}
```

#### DELETE `/api/reviews`
Delete a review.

**Request Body:**
```json
{
  "reviewId": "15"
}
```

**Response:**
```json
{
  "message": "Review deleted successfully"
}
```

### Components

#### 1. ReviewsContext (`components/reviews-context.tsx`)
Global state management for reviews.

**Features:**
- Fetches all reviews from API
- Calculates statistics (total, pending, approved, featured, average rating)
- Auto-refreshes every 30 seconds
- Provides CRUD operations
- Filters reviews by approval/featured status

**Usage:**
```tsx
import { useReviews } from '@/components/reviews-context'

const { reviews, stats, submitReview, approveReview } = useReviews()
```

#### 2. ReviewSubmissionDialog (`components/review-submission-dialog.tsx`)
Customer-facing review submission form.

**Props:**
- `trigger` - Custom trigger button (optional)
- `bookingId` - Link review to specific booking (optional)
- `officeRoomId` - Room being reviewed (optional)
- `onSuccess` - Callback after successful submission

**Usage:**
```tsx
<ReviewSubmissionDialog
  bookingId="12"
  officeRoomId="1"
  onSuccess={() => console.log('Review submitted!')}
/>
```

#### 3. FeaturedReviewsSection (`components/featured-reviews-section.tsx`)
Homepage reviews display.

**Features:**
- Fetches featured and approved reviews
- Shows up to 3 reviews
- Prioritizes featured reviews
- Fallback to static reviews if API fails
- Loading skeleton states

**Usage:**
```tsx
import { FeaturedReviewsSection } from '@/components/featured-reviews-section'

<FeaturedReviewsSection />
```

#### 4. PublicReviewsPage (`components/public-reviews-page.tsx`)
Full reviews page for customers.

**Features:**
- Displays all approved reviews
- Shows statistics (total, average rating)
- Review submission button
- Responsive grid layout
- Empty states
- Call-to-action section

**Usage:**
```tsx
import { PublicReviewsPage } from '@/components/public-reviews-page'

export default function CustomerReviewsPage() {
  return <PublicReviewsPage />
}
```

## User Workflows

### Customer Workflow

#### Submitting a Review:
1. Customer completes a booking
2. Booking status changes to "completed"
3. "Write Review" button appears in transactions
4. Customer clicks button and dialog opens
5. Customer selects star rating (1-5)
6. Customer writes optional title
7. Customer writes review text (required)
8. Customer submits review
9. Review goes to pending status
10. Customer receives confirmation message

#### Viewing Reviews:
1. Customer visits homepage
2. Sees featured reviews in testimonials section
3. Customer visits `/customer-reviews` page
4. Sees all approved reviews
5. Can submit their own review from this page

### Admin/Staff Workflow

#### Approving Reviews:
1. Admin goes to Dashboard → Reviews
2. Sees pending reviews count in stats
3. Clicks "Pending" tab
4. Reviews pending submissions
5. Clicks "Approve" button
6. Review becomes visible to public
7. Stats update automatically

#### Featuring Reviews:
1. Admin views approved reviews
2. Identifies high-quality reviews
3. Clicks "Feature" button
4. Review appears on homepage
5. Review gets "Featured" badge
6. Automatically approved if not already

#### Deleting Reviews:
1. Admin identifies inappropriate review
2. Clicks "Delete" button
3. Confirmation dialog appears
4. Admin confirms deletion
5. Review permanently removed
6. Stats update automatically

## Integration Points

### 1. Transaction Dialog
Reviews can be submitted from completed bookings:

```tsx
// In components/transactions-dialog.tsx
{booking.status === "completed" && (
  <ReviewSubmissionDialog
    bookingId={booking.id}
    officeRoomId="1"
    trigger={
      <Button variant="outline" size="sm">
        <Star className="mr-2 h-4 w-4" />
        Write Review
      </Button>
    }
  />
)}
```

### 2. Homepage
Featured reviews displayed automatically:

```tsx
// In app/page.tsx
import { FeaturedReviewsSection } from '@/components/featured-reviews-section'

<FeaturedReviewsSection />
```

### 3. Admin Dashboard
Full review management interface:

```tsx
// In app/reviews/page.tsx
import { useReviews } from '@/components/reviews-context'

const { reviews, stats, approveReview, featureReview, deleteReview } = useReviews()
```

## Routes

### Public Routes
- `/` - Homepage with featured reviews
- `/customer-reviews` - Full reviews page

### Admin Routes
- `/dashboard/reviews` - Review management dashboard

## Styling & UI

### Color Scheme
- **Pending**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Approved**: Green (`bg-green-100 text-green-800`)
- **Featured**: Purple (`bg-purple-100 text-purple-800`)
- **Stars**: Yellow (`fill-yellow-400 text-yellow-400`)

### Icons
- **Star**: Rating display
- **User**: Customer name
- **Calendar**: Review date
- **MapPin**: Room/venue
- **MessageSquare**: Write review
- **CheckCircle**: Approve action
- **Award**: Feature action
- **Trash2**: Delete action

## Real-time Features

### Auto-refresh Mechanism
```tsx
useEffect(() => {
  refreshReviews()
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(refreshReviews, 30000)
  return () => clearInterval(interval)
}, [refreshReviews])
```

### Manual Refresh
Admin dashboard includes refresh button:
```tsx
<Button onClick={refreshReviews} variant="outline" size="sm">
  <RefreshCw className="h-4 w-4 mr-2" />
  Refresh
</Button>
```

## Validation & Security

### Client-side Validation
- Rating: Required, 1-5 stars
- Review text: Required, max 1000 characters
- Title: Optional, max 100 characters
- Authentication: User must be logged in

### Server-side Validation
- User ID validation
- Office room ID validation
- Rating range check (1-5)
- Required fields check
- SQL injection prevention (parameterized queries)

### Authorization
- Only authenticated users can submit reviews
- Only admins/staff can approve/feature/delete reviews
- Users can only review after completing bookings

## Performance Optimizations

### 1. Lazy Loading
- Reviews fetched on-demand
- Homepage shows only 3 featured reviews
- Full list loaded on dedicated page

### 2. Caching
- Context maintains review state
- Reduces API calls
- Auto-refresh keeps data fresh

### 3. Optimistic Updates
- UI updates immediately
- Background API calls
- Rollback on error

## Error Handling

### API Errors
```tsx
try {
  const success = await submitReview(reviewData)
  if (success) {
    toast({ title: "Review Submitted!" })
  } else {
    toast({ title: "Submission Failed", variant: "destructive" })
  }
} catch (error) {
  console.error('Error:', error)
  toast({ title: "Error", variant: "destructive" })
}
```

### Fallback Content
- Static reviews if API fails
- Empty state messages
- Loading skeletons

## Testing Scenarios

### Test 1: Submit Review
1. Log in as customer
2. Complete a booking
3. Open transactions dialog
4. Click "Write Review"
5. Fill out form
6. Submit review
7. Verify pending status

### Test 2: Approve Review
1. Log in as admin
2. Go to Reviews dashboard
3. Click "Pending" tab
4. Click "Approve" on a review
5. Verify it appears in "Approved" tab
6. Check public page shows the review

### Test 3: Feature Review
1. Log in as admin
2. Go to Reviews dashboard
3. Click "Approved" tab
4. Click "Feature" on a review
5. Verify it appears in "Featured" tab
6. Check homepage shows the review

### Test 4: Delete Review
1. Log in as admin
2. Go to Reviews dashboard
3. Click "Delete" on a review
4. Confirm deletion
5. Verify review is removed
6. Check stats update

### Test 5: Real-time Updates
1. Open admin dashboard
2. Wait 30 seconds
3. Verify reviews refresh automatically
4. Submit new review in another tab
5. Wait for auto-refresh
6. Verify new review appears

## Future Enhancements

### Potential Features:
- [ ] Review replies from admin
- [ ] Photo uploads with reviews
- [ ] Review voting (helpful/not helpful)
- [ ] Review filtering by rating
- [ ] Review search functionality
- [ ] Email notifications for new reviews
- [ ] Review moderation queue
- [ ] Spam detection
- [ ] Review analytics dashboard
- [ ] Export reviews to CSV
- [ ] Review widgets for external sites
- [ ] Social media sharing
- [ ] Review reminders after events

## Troubleshooting

### Reviews Not Showing
- Check if reviews are approved (`is_approved = true`)
- Verify API endpoint is responding
- Check browser console for errors
- Ensure ReviewsProvider is in layout

### Can't Submit Review
- Verify user is logged in
- Check localStorage/sessionStorage for user data
- Ensure database connection is working
- Check API endpoint logs

### Stats Not Updating
- Verify auto-refresh is working
- Check network tab for API calls
- Manually click refresh button
- Clear browser cache

## File Structure

```
app/
├── api/
│   └── reviews/
│       └── route.ts                 # Reviews API endpoints
├── reviews/
│   └── page.tsx                     # Admin reviews management
├── customer-reviews/
│   └── page.tsx                     # Public reviews page
└── page.tsx                         # Homepage (with featured reviews)

components/
├── reviews-context.tsx              # Global state management
├── review-submission-dialog.tsx     # Customer submission form
├── featured-reviews-section.tsx     # Homepage reviews display
├── public-reviews-page.tsx          # Full public reviews page
└── transactions-dialog.tsx          # Updated with review button
```

## Summary

The customer review system provides a complete solution for collecting, managing, and displaying customer feedback. With real-time updates, intuitive interfaces, and comprehensive admin controls, it enhances customer engagement and builds trust through authentic testimonials.

**Key Achievements:**
- ✅ Customer review submission with validation
- ✅ Admin approval and featuring workflow
- ✅ Real-time updates every 30 seconds
- ✅ Featured reviews on homepage
- ✅ Dedicated public reviews page
- ✅ Complete CRUD operations
- ✅ Statistics and analytics
- ✅ Responsive design
- ✅ Error handling and fallbacks
- ✅ Integration with booking system

