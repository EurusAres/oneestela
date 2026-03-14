# Database Integration Guide

## Overview
Your application contexts have been updated to use the MySQL database instead of localStorage. Changes made in the UI now automatically persist to the database.

## What Changed

### 1. **Auth Context** (`components/auth-context.tsx`)
- `login()` - Now calls `/api/auth/login` endpoint
- `signup()` - Now calls `/api/auth/register` endpoint
- User data is stored in the database and retrieved on successful authentication

### 2. **Booking Context** (`components/booking-context.tsx`)
- Loads bookings from `/api/bookings` on mount
- `addBooking()` - POST to `/api/bookings`
- `updateBookingStatus()` - PUT to `/api/bookings?id=bookingId`
- `cancelBooking()` - DELETE to `/api/bookings?id=bookingId`
- `modifyBooking()` - PUT to `/api/bookings?id=bookingId`

### 3. **Message Context** (`components/message-context.tsx`)
- Loads contact messages from `/api/contact` on mount
- `addMessage()` - POST to `/api/contact`
- `updateMessageStatus()` - PUT to `/api/contact?id=messageId`

### 4. **Payment Proof Context** (`components/payment-proof-context.tsx`)
- Loads payment proofs from `/api/payment-proofs` on mount
- `uploadPaymentProof()` - POST to `/api/payment-proofs`
- `verifyPaymentProof()` - PUT to `/api/payment-proofs?id=proofId`
- `rejectPaymentProof()` - PUT to `/api/payment-proofs?id=proofId`

## Key Features

✅ **Persistent Storage** - All data is automatically saved to MySQL database
✅ **Real-time Sync** - Context state updates when API calls succeed
✅ **Error Handling** - Console errors logged for debugging
✅ **Session Management** - User sessions stored in both localStorage and database
✅ **Automatic Loading** - Data fetches from database on component mount

## Setup Steps

1. **Set Environment Variables** in Project Settings:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=one_estela_place
   ```

2. **Run Database Setup**:
   ```bash
   npm install
   node scripts/setup-complete.js
   ```

3. **Verify Connection**:
   - Make a booking or add a contact message
   - Check the data persists after page refresh
   - Data should appear in MySQL database

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings?id=bookingId` - Update booking
- `DELETE /api/bookings?id=bookingId` - Delete booking

### Contact Messages
- `GET /api/contact` - Get all messages
- `POST /api/contact` - Submit new contact message
- `PUT /api/contact?id=messageId` - Update message status

### Payment Proofs
- `GET /api/payment-proofs` - Get all payment proofs
- `POST /api/payment-proofs` - Upload payment proof
- `PUT /api/payment-proofs?id=proofId` - Verify/reject payment

### Office Rooms
- `GET /api/office-rooms` - Get all office rooms
- `POST /api/office-rooms` - Add new room

### Chat
- `GET /api/chat` - Get chat history
- `POST /api/chat` - Send message

### Staff
- `GET /api/staff` - Get staff list

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Submit review

### Venues
- `GET /api/venues` - Get venues

## Testing the Database

### 1. Test Authentication
```javascript
// In browser console
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  })
}).then(r => r.json()).then(console.log)
```

### 2. Test Bookings
```javascript
// Create a booking
fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '1',
    eventName: 'Test Event',
    eventType: 'wedding',
    guestCount: 100,
    date: '2025-12-25',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
    specialRequests: 'Test request',
    status: 'pending',
    userInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234'
    }
  })
}).then(r => r.json()).then(console.log)
```

## Database Schema

See `DATABASE_STRUCTURE.md` for complete schema details with all tables and relationships.

## Troubleshooting

### Data Not Persisting?
1. Check environment variables are set correctly
2. Verify database connection: `node scripts/setup-complete.js`
3. Check browser console for API errors
4. Verify MySQL server is running

### API Returning 500 Error?
1. Check backend logs in terminal
2. Verify database tables exist: `mysql -u user -p database_name`
3. Check that required fields are being sent with requests

### Still Using localStorage?
- Clear browser localStorage: `localStorage.clear()`
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check that you're using updated context hooks

## Next Steps

1. Update remaining contexts (Chat, CMS, Staff, Reports) using the same pattern
2. Implement user authentication with session tokens
3. Add role-based access control for admin features
4. Set up WebSocket for real-time chat updates
5. Add data validation and error handling to API routes

## Support

For issues or questions about database integration:
1. Check the database logs: `tail -f mysql.log`
2. Review API response status codes
3. Verify all environment variables are set
4. Check that `node scripts/setup-complete.js` completed successfully
