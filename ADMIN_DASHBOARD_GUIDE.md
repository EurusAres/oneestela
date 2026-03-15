# Admin Dashboard Guide

## Overview
Your admin dashboard is now fully functional and connected to the MySQL database with real customer booking data.

## Login Credentials
- **Email:** admin@oneestela.com
- **Password:** admin123

## Dashboard Features

### 1. Main Dashboard (`/dashboard`)
The main dashboard displays comprehensive statistics and analytics:

#### Key Metrics
- **Total Bookings:** Shows all bookings across all statuses
- **Total Revenue:** Sum of all booking payments
- **Active Users:** Number of registered customers
- **Average Rating:** Customer satisfaction score from reviews

#### Status Overview
- **Confirmed:** Approved bookings ready to proceed
- **Pending:** New booking requests awaiting admin approval
- **Cancelled:** Bookings that were cancelled
- **Unread Messages:** Contact form submissions needing attention

#### Charts & Analytics
- **Monthly Bookings:** Trend chart showing booking volume over time
- **Monthly Revenue:** Revenue trends for the last 6 months
- **Bookings by Room:** Which rooms are most popular
- **Recent Bookings:** Latest 10 booking requests with quick actions
- **Top Customers:** Best customers by revenue and booking count

#### Quick Actions
From the dashboard, you can:
- ✅ Confirm pending bookings (green checkmark button)
- ❌ Cancel/decline bookings (red X button)
- 🔄 Refresh data to see latest updates

### 2. Bookings Management (`/dashboard/bookings`)
Dedicated page for managing all booking requests:

#### Features
- View all bookings with detailed information
- Filter by status (pending, confirmed, completed, cancelled)
- See customer contact information
- View special requests and requirements
- Quick action buttons for each booking

#### Actions Available
- **Confirm Booking:** Approve a pending booking request
- **Decline Booking:** Reject a booking request
- **Mark as Completed:** Update status after event is finished
- **Contact Customer:** Opens email client with pre-filled message
- **View Details:** See full booking information in a modal

#### Booking Information Displayed
- Event name and type
- Date and time (check-in to check-out)
- Number of guests
- Customer name, email, phone
- Special requests
- Total price
- Booking status
- Submission date

### 3. Sample Data Included

#### Bookings (9 total)
- **3 Pending:** Awaiting your approval
- **3 Confirmed:** Approved and scheduled
- **2 Completed:** Past events that finished successfully
- **1 Cancelled:** Cancelled by customer

#### Reviews (6 total)
- Average rating: 4.8/5 stars
- All approved and visible
- Linked to specific rooms and bookings

#### Contact Messages (7 total)
- 3 unread messages requiring attention
- Various inquiries about services, pricing, and availability

#### Users (3 customers + 1 admin)
- Real customer accounts with booking history
- Admin account for dashboard access

#### Office Rooms (4 available)
- Executive Suite (₱250/hour)
- Conference Hall (₱150/hour)
- Meeting Room A (₱75/hour)
- Meeting Room B (₱85/hour)

## How to Use the Dashboard

### Approving Bookings
1. Login as admin
2. Go to Dashboard or Bookings page
3. Find pending bookings (yellow badge)
4. Click "Confirm Booking" button (green)
5. Customer will see updated status

### Declining Bookings
1. Find the pending booking
2. Click "Decline Booking" button (red)
3. Booking status changes to declined

### Contacting Customers
1. Click "Contact Customer" button
2. Email client opens with pre-filled template
3. Edit message and send

### Viewing Statistics
- Dashboard auto-refreshes every 30 seconds
- Click "Refresh" button for manual update
- Charts show trends over last 6 months
- Revenue calculations include only confirmed/completed bookings

## Database Structure

### Bookings Table
- Stores all customer reservations
- Links to users and office rooms
- Tracks status changes
- Records payment amounts

### Users Table
- Customer accounts
- Admin accounts
- Staff accounts

### Reviews Table
- Customer feedback
- Star ratings (1-5)
- Approval status

### Contact Messages Table
- Form submissions
- Read/unread status
- Reply tracking

## API Endpoints Used

### Dashboard Stats
- `GET /api/dashboard/stats` - Fetches all dashboard statistics

### Bookings
- `GET /api/bookings` - List all bookings
- `GET /api/bookings?userId=X` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings?id=X` - Update booking status
- `DELETE /api/bookings?id=X` - Cancel booking

## Testing the Dashboard

### Test Scenario 1: Approve a Booking
1. Login as admin
2. Go to Bookings page
3. Find a pending booking
4. Click "Confirm Booking"
5. Verify status changes to "Confirmed"
6. Check dashboard stats update

### Test Scenario 2: View Analytics
1. Go to main Dashboard
2. Check total bookings count
3. View monthly revenue chart
4. See bookings by room distribution
5. Review top customers list

### Test Scenario 3: Contact Customer
1. Find any booking
2. Click "Contact Customer"
3. Email opens with booking details
4. Send inquiry or confirmation

## Resetting Data

If you want to reset the sample data:

```bash
# Reset all bookings
node scripts/seed-bookings.js

# Add reviews and messages
node scripts/seed-additional-data.js

# Complete reset (database + data)
node scripts/setup-complete.js
node scripts/reset-admin-password.js
node scripts/seed-bookings.js
node scripts/seed-additional-data.js
```

## Troubleshooting

### Dashboard shows no data
- Check if database is running
- Verify .env file has correct credentials
- Run seed scripts to add sample data

### Can't login as admin
- Run: `node scripts/reset-admin-password.js`
- Use: admin@oneestela.com / admin123

### Stats not updating
- Click the Refresh button
- Check browser console for errors
- Verify API endpoints are working

### Bookings not appearing
- Check /api/bookings endpoint
- Verify database connection
- Run seed-bookings.js script

## Next Steps

### For Production
1. Replace sample data with real bookings
2. Set up email notifications for new bookings
3. Add payment gateway integration
4. Implement booking confirmation emails
5. Add calendar view for availability
6. Create booking reports export (PDF/Excel)

### Additional Features to Consider
- SMS notifications for customers
- Automated booking reminders
- Customer dashboard for self-service
- Online payment processing
- Booking modification by customers
- Cancellation policies and refunds
- Multi-admin role management
- Activity logs and audit trail

## Support

For issues or questions:
1. Check the database connection in .env
2. Review API logs in browser console
3. Verify MySQL is running
4. Check scripts/check-db.js for database status

---

**Your admin dashboard is ready to use!** 🎉

Login now and start managing customer bookings efficiently.
