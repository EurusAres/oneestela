# MySQL Database Setup Guide

This guide walks you through setting up the MySQL database for the One Estela Place venue booking system.

## Prerequisites

- MySQL Server 5.7+ installed and running
- Node.js 16+ installed
- pnpm package manager installed

## Step 1: Install Dependencies

First, install the required npm packages:

```bash
pnpm install
```

This will install `mysql2` and `bcrypt` which are needed for database operations.

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your project with your MySQL connection details:

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your database credentials
```

Edit `.env.local` and update these values:

```env
DB_HOST=localhost          # Your MySQL server host
DB_USER=root              # Your MySQL username
DB_PASSWORD=your_password # Your MySQL password
DB_NAME=estela_place      # Database name (will be created if it doesn't exist)
DB_PORT=3306              # MySQL port (default is 3306)
```

## Step 3: Run the Database Setup

Execute the setup script to create the database and tables:

```bash
node scripts/setup-db.js
```

This script will:
1. Create the database (if it doesn't exist)
2. Create all necessary tables with proper relationships
3. Set up indexes for better performance

You should see output like:
```
✓ Database created or already exists
✓ Database selected
✓ All tables created successfully
✓ Setup complete!
```

## Step 4: (Optional) Seed Initial Data

You can optionally seed the database with demo data. Create a `scripts/seed-db.js` file with your sample data and run it.

## Database Schema

The database includes the following main tables:

### Core Tables
- **users** - User accounts (login, registration)
- **user_info** - Extended user profile information
- **venues** - Venue information
- **office_rooms** - Office/meeting rooms available for booking

### Booking & Reservations
- **bookings** - Booking records and reservations
- **payment_proofs** - Payment proof uploads
- **transactions** - Payment transaction history

### Communication
- **contact_messages** - Contact form submissions
- **chat_messages** - In-app messaging between users and staff

### Staff & CMS
- **staff** - Staff member information
- **cms_content** - Editable content for website pages

### Additional
- **reviews** - User reviews of office rooms
- **reports** - User reports and feedback

## API Endpoints

The following API endpoints are now available:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Bookings
- `GET /api/bookings` - Get bookings (optional: ?userId=id)
- `POST /api/bookings` - Create new booking

### Office Rooms
- `GET /api/office-rooms` - Get available rooms (optional: ?venueId=id)
- `POST /api/office-rooms` - Create new office room

### Contact
- `GET /api/contact` - Get contact messages (optional: ?status=unread)
- `POST /api/contact` - Submit contact form

### Payment
- `GET /api/payment-proofs` - Get payment proofs (optional: ?bookingId=id or ?userId=id)
- `POST /api/payment-proofs` - Upload payment proof

### Chat
- `GET /api/chat` - Get messages (optional: ?senderId=id, ?receiverId=id, ?bookingId=id)
- `POST /api/chat` - Send chat message

## Connecting Frontend Components

To use the database in your React components:

```typescript
// Example: Fetch bookings
const response = await fetch('/api/bookings?userId=123');
const { bookings } = await response.json();

// Example: Create a booking
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 123,
    officeRoomId: 45,
    checkInDate: '2024-01-15T09:00:00',
    checkOutDate: '2024-01-15T17:00:00',
    numberOfGuests: 5,
    specialRequests: 'WiFi needed',
    totalPrice: 500
  })
});
const { bookingId } = await response.json();
```

## Troubleshooting

### Connection Issues
- Ensure MySQL is running: `mysql -u root -p`
- Check if your credentials in `.env.local` are correct
- Verify the database user has create privileges

### Table Creation Fails
- Check MySQL error logs for specific errors
- Ensure all foreign key references are correct
- Try dropping and recreating the database

### API Endpoints Not Working
- Check that the server is running in development mode: `pnpm dev`
- Verify environment variables are loaded correctly
- Check browser console and server logs for errors

## Next Steps

1. Update your context components to use the API endpoints instead of localStorage
2. Implement proper authentication/session management
3. Add validation and error handling to API routes
4. Set up automated backups for your database
5. Configure appropriate database user permissions for production

## Production Deployment

For production, ensure you:
1. Use strong passwords for database users
2. Configure proper database backups
3. Use SSL connections for remote databases
4. Implement proper input validation and sanitization
5. Use environment variables from Vercel's secret management
6. Set up database replication or managed services (AWS RDS, etc.)
