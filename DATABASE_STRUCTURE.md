# Database Structure Documentation

## Overview

This document describes the complete MySQL database structure for the One Estela Place venue booking system.

## Table: users

Stores user accounts and authentication information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | User unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| role | ENUM | NOT NULL | 'admin' or 'client' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

## Table: venues

Stores information about venue locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Venue unique identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Venue name |
| description | TEXT | | Detailed venue description |
| location | VARCHAR(255) | NOT NULL | Physical address |
| max_capacity | INT | | Maximum occupancy |
| image_url | VARCHAR(255) | | Featured image URL |
| is_active | BOOLEAN | DEFAULT 1 | Venue availability status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

## Table: office_rooms

Stores individual rooms/spaces available for booking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Room unique identifier |
| venue_id | INT | NOT NULL, FOREIGN KEY | Reference to venues table |
| name | VARCHAR(255) | NOT NULL | Room name |
| description | TEXT | | Room details |
| capacity | INT | NOT NULL | Maximum occupancy |
| price_per_hour | DECIMAL(10,2) | NOT NULL | Hourly rental rate |
| amenities | TEXT | | Comma-separated list of features |
| image_url | VARCHAR(255) | | Room image URL |
| is_available | BOOLEAN | DEFAULT 1 | Availability status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:** 
- venue_id
- is_available

## Table: bookings

Stores room reservation information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Booking unique identifier |
| user_id | INT | NOT NULL, FOREIGN KEY | Reference to users table |
| office_room_id | INT | NOT NULL, FOREIGN KEY | Reference to office_rooms table |
| booking_date | DATE | NOT NULL | Reservation date |
| start_time | TIME | NOT NULL | Start time |
| end_time | TIME | NOT NULL | End time |
| number_of_guests | INT | NOT NULL | Expected attendees |
| special_requests | TEXT | | Additional requirements |
| status | ENUM | DEFAULT 'pending' | 'pending', 'confirmed', 'cancelled' |
| total_price | DECIMAL(10,2) | | Calculated booking cost |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Booking creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- user_id
- office_room_id
- booking_date
- status

## Table: payment_proofs

Stores payment evidence for bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Payment record ID |
| user_id | INT | NOT NULL, FOREIGN KEY | Reference to users table |
| booking_id | INT | NOT NULL, FOREIGN KEY | Reference to bookings table |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_method | VARCHAR(50) | | Bank transfer, card, cash, etc. |
| proof_file_url | VARCHAR(255) | | Receipt/proof image URL |
| transaction_id | VARCHAR(100) | | Payment transaction reference |
| verification_status | ENUM | DEFAULT 'pending' | 'pending', 'verified', 'rejected' |
| notes | TEXT | | Admin notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- user_id
- booking_id
- verification_status

## Table: contact_messages

Stores inquiry messages from the contact form.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Message ID |
| name | VARCHAR(255) | NOT NULL | Sender's name |
| email | VARCHAR(255) | NOT NULL | Sender's email |
| phone | VARCHAR(20) | | Sender's phone |
| subject | VARCHAR(255) | NOT NULL | Message subject |
| message | TEXT | NOT NULL | Message content |
| status | ENUM | DEFAULT 'new' | 'new', 'in_progress', 'resolved' |
| response | TEXT | | Admin response |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- status
- email

## Table: chat_messages

Stores real-time chat between users and admins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Message ID |
| user_id | INT | NOT NULL, FOREIGN KEY | User initiating chat |
| admin_id | INT | | Admin responding (if applicable) |
| message | TEXT | NOT NULL | Message content |
| sender_type | ENUM | DEFAULT 'user' | 'user' or 'admin' |
| is_read | BOOLEAN | DEFAULT 0 | Message read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message time |

**Indexes:**
- user_id
- admin_id
- is_read

## Table: reviews

Stores customer reviews and ratings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Review ID |
| user_id | INT | NOT NULL, FOREIGN KEY | Reviewer (must be authenticated) |
| office_room_id | INT | NOT NULL, FOREIGN KEY | Room being reviewed |
| rating | INT | NOT NULL | Star rating (1-5) |
| title | VARCHAR(255) | | Review headline |
| comment | TEXT | | Detailed review |
| is_approved | BOOLEAN | DEFAULT 1 | Moderation status |
| helpful_count | INT | DEFAULT 0 | Number of helpful votes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review submission time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:** 
- UNIQUE(user_id, office_room_id) - One review per user per room
- CHECK(rating >= 1 AND rating <= 5)

**Indexes:**
- office_room_id
- user_id
- is_approved

## Table: staff

Stores venue staff member information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Staff member ID |
| venue_id | INT | NOT NULL, FOREIGN KEY | Associated venue |
| name | VARCHAR(255) | NOT NULL | Staff member's name |
| position | VARCHAR(100) | NOT NULL | Job title |
| email | VARCHAR(255) | UNIQUE | Work email |
| phone | VARCHAR(20) | | Contact number |
| specialization | VARCHAR(100) | | Area of expertise |
| bio | TEXT | | Staff biography |
| photo_url | VARCHAR(255) | | Profile photo |
| is_active | BOOLEAN | DEFAULT 1 | Employment status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- venue_id
- is_active

## Table: homepage_content

CMS table for dynamic homepage content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Content block ID |
| section | VARCHAR(100) | NOT NULL | Page section name |
| title | VARCHAR(255) | | Section title |
| description | TEXT | | Section content |
| image_url | VARCHAR(255) | | Background/featured image |
| button_text | VARCHAR(100) | | CTA button label |
| button_link | VARCHAR(255) | | Button destination URL |
| display_order | INT | DEFAULT 0 | Sort order |
| is_active | BOOLEAN | DEFAULT 1 | Display status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- section
- display_order

## Relationships Diagram

```
users (1) ──── (many) bookings
  │                        │
  │                        ├──── office_rooms
  │                        │           │
  │                        │           └──── venues
  │
  ├──── (many) contact_messages
  │
  ├──── (many) chat_messages
  │
  ├──── (many) payment_proofs ──── bookings
  │
  └──── (many) reviews ──── office_rooms

staff ──── venues

homepage_content (no relationships - CMS table)
```

## Helper Functions

The application includes helper functions in `/lib/db-helpers.ts`:

- `getUserByEmail(email)` - Fetch user by email
- `getUserBookings(userId)` - Get all user's bookings
- `getAvailableRooms()` - List available rooms
- `checkRoomAvailability(roomId, date, startTime, endTime)` - Check availability
- `getContactMessages(status)` - Get contact form messages
- `getRoomReviews(roomId)` - Get room reviews
- `getRoomAverageRating(roomId)` - Calculate average rating
- `getVenueStaff(venueId)` - Get venue staff
- `getChatHistory(userId, limit)` - Get chat messages
- `getBookingPaymentProofs(bookingId)` - Get payment proofs
- `getBookingStats()` - Dashboard statistics
- `getRevenueStats()` - Revenue calculations

## Constraints & Validations

### Data Integrity
- Foreign keys enforce referential integrity
- Unique indexes prevent duplicate entries
- Check constraints validate data ranges

### Security
- Passwords are bcrypt hashed
- SQL injection prevention via parameterized queries
- Database user has minimum required permissions

### Performance
- Indexes on frequently queried columns
- Connection pooling for efficient resource use
- Query optimization for common operations

## Backup & Maintenance

### Regular Backups
```bash
mysqldump -u DB_USER -p DB_NAME > backup.sql
```

### Restore from Backup
```bash
mysql -u DB_USER -p DB_NAME < backup.sql
```

### Database Size Monitoring
```sql
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) MB 
FROM information_schema.tables 
WHERE table_schema = 'one_estela_place';
```

## Future Enhancements

- Add audit logging for compliance
- Implement soft deletes for data recovery
- Add full-text search on descriptions
- Implement caching strategy for frequently accessed data
- Add data partitioning for large tables
