# Quick Start Guide - MySQL Database Setup

## Prerequisites

- MySQL 8.0+ installed and running on your machine
- Node.js 18+ and npm/pnpm installed
- A MySQL user account with appropriate permissions

## Step 1: Set Environment Variables

Add your MySQL credentials to the project settings (top-right settings menu):

```
DB_HOST=localhost          # Your MySQL server address
DB_USER=root               # Your MySQL username
DB_PASSWORD=your_password  # Your MySQL password
DB_NAME=one_estela_place   # Database name to create
```

## Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

This installs the required packages:
- `mysql2` - MySQL client for Node.js
- `bcrypt` - For password hashing

## Step 3: Set Up the Database

Run the setup script to create the database schema and seed initial data:

```bash
node scripts/setup-complete.js
```

This will:
- Create the database if it doesn't exist
- Create all required tables with proper indexes and constraints
- Seed initial demo data for testing
- Display a success message with next steps

## Step 4: Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see your application with the database connected.

## Database Schema Overview

The application uses 9 main tables:

### users
- Stores user accounts with authentication
- Fields: id, email, password_hash, full_name, role, created_at, updated_at
- Roles: `admin`, `client`

### bookings
- Stores venue/room reservations
- Linked to: users, office_rooms
- Status: `pending`, `confirmed`, `cancelled`

### office_rooms
- Stores individual rooms/spaces at the venue
- Linked to: venues
- Includes: name, capacity, price per hour, amenities, images

### contact_messages
- Stores messages from the contact form
- Status: `new`, `in_progress`, `resolved`

### staff
- Stores staff members and their information
- Linked to: venues
- Tracks: position, email, phone, specialization

### payment_proofs
- Stores payment evidence for bookings
- Linked to: users, bookings
- Tracks: amount, payment method, proof file

### reviews
- Stores customer reviews and ratings
- Linked to: users, office_rooms
- Rating scale: 1-5 stars

### venues
- Stores venue information
- Linked to: office_rooms
- Main venue: "One Estela Place"

### homepage_content
- CMS content for dynamic homepage
- Fields: section, title, description, image_url, button_text, display_order

## API Endpoints

The following API endpoints are available:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Office Rooms
- `GET /api/office-rooms` - Get all rooms
- `POST /api/office-rooms` - Create new room

### Contact Messages
- `GET /api/contact` - Get all messages
- `POST /api/contact` - Submit contact form

### Other Resources
- `GET /api/staff` - Get staff members
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Submit review
- `GET /api/venues` - Get venues
- `GET /api/chat` - Get chat messages
- `POST /api/chat` - Send chat message
- `POST /api/payment-proofs` - Upload payment proof

## Demo Credentials

After seeding the database, you can use these credentials to log in:

**Admin Account:**
- Email: `admin@oneestela.com`
- Password: Will need to be set during registration/login flow

**Test Client Accounts:**
- Email: `user@example.com`
- Email: `client2@example.com`

## Troubleshooting

### Connection Error
If you get "Error connecting to MySQL":
1. Verify MySQL is running: `mysql -u root -p`
2. Check DB_HOST, DB_USER, DB_PASSWORD environment variables
3. Ensure the user has permission to create databases

### Password Hash Error
If you see bcrypt-related errors:
- Reinstall dependencies: `npm install`
- Make sure `@types/bcrypt` is in devDependencies

### Database Already Exists
If the database already exists and you want to reset it:
1. Drop the database: `DROP DATABASE one_estela_place;`
2. Run the setup script again

## File Locations

- **Schema Definition:** `/scripts/init-database.sql`
- **Seed Data:** `/scripts/seed-data.sql`
- **Setup Script:** `/scripts/setup-complete.js`
- **Database Connection Utility:** `/lib/db.ts`
- **API Routes:** `/app/api/`

## Next Steps

1. Review the API routes in `/app/api/` to understand the endpoints
2. Update React components to use API calls instead of localStorage
3. Implement proper authentication flow with session management
4. Add form validation and error handling
5. Set up file uploads for payment proofs and images

For detailed information about the database setup, see `DATABASE_SETUP.md`.
