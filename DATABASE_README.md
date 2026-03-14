# 🗄️ MySQL Database for One Estela Place

## Welcome! 👋

Your venue booking website now has a complete MySQL database backend. This README will guide you through everything you need to know.

---

## 🎯 What's Been Set Up

### ✅ Database Infrastructure
- **10 optimized MySQL tables** with proper relationships
- **Connection pooling** for efficient resource management  
- **Indexes and constraints** for data integrity and performance
- **Parameterized queries** to prevent SQL injection

### ✅ 10 API Endpoints
Ready-to-use endpoints for:
- User authentication (register, login)
- Booking management (CRUD)
- Room availability checking
- Contact form submission
- Payment proof uploads
- Chat messaging
- Reviews and ratings
- Staff management
- Venue information

### ✅ Helper Functions
12+ pre-built functions for common database operations like:
- Checking room availability
- Fetching user bookings
- Getting reviews and ratings
- Managing payments
- Analytics and reporting

### ✅ Complete Documentation
- Quick start guide (`QUICKSTART.md`)
- Detailed setup instructions (`DATABASE_SETUP.md`)
- Complete schema reference (`DATABASE_STRUCTURE.md`)
- Implementation overview (`DATABASE_IMPLEMENTATION.md`)
- Setup checklist (`SETUP_CHECKLIST.md`)

---

## 🚀 Get Started in 3 Steps

### 1️⃣ Set Environment Variables

In your Vercel project settings (top-right menu), go to **Vars** and add:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=one_estela_place
```

Replace `localhost` and credentials with your MySQL setup.

### 2️⃣ Install Dependencies

```bash
npm install
```

This adds `mysql2` and `bcrypt` packages.

### 3️⃣ Initialize Database

```bash
node scripts/setup-complete.js
```

This creates the database, all tables, and seeds demo data.

---

## 📊 Database Tables Overview

| Table | Purpose | Records |
|-------|---------|---------|
| **users** | User accounts & auth | Admins & Clients |
| **bookings** | Room reservations | All reservations |
| **office_rooms** | Available spaces | 4 sample rooms |
| **venues** | Venue info | 1 main venue |
| **payment_proofs** | Payment receipts | Booking proofs |
| **contact_messages** | Form submissions | Support tickets |
| **chat_messages** | User-admin chat | Conversation history |
| **reviews** | Customer feedback | Ratings & comments |
| **staff** | Team members | 3 sample staff |
| **homepage_content** | CMS blocks | Dynamic content |

---

## 🔌 API Routes Available

### Authentication
```
POST /api/auth/register    - Create new user account
POST /api/auth/login       - Authenticate user
```

### Bookings
```
GET  /api/bookings         - List all bookings
POST /api/bookings         - Create new booking
PUT  /api/bookings/[id]    - Update booking
DEL  /api/bookings/[id]    - Cancel booking
```

### Rooms & Venues
```
GET /api/office-rooms      - List available rooms
POST /api/office-rooms     - Add new room
GET /api/venues            - Get venue details
```

### Communication
```
POST /api/contact          - Submit contact form
GET  /api/reviews          - View all reviews
POST /api/reviews          - Submit review
GET  /api/chat             - Fetch messages
POST /api/chat             - Send message
```

### Admin Features
```
GET  /api/staff            - List staff members
POST /api/payment-proofs   - Upload payment proof
```

---

## 🛠️ Key Features

### Security
✅ **Bcrypt Password Hashing** - Secure password storage
✅ **SQL Injection Prevention** - Parameterized queries throughout
✅ **Environment Variables** - Sensitive data never hardcoded
✅ **Connection Pooling** - Efficient resource management

### Performance
✅ **Database Indexes** - Fast queries on frequently accessed columns
✅ **Connection Reuse** - Pooling prevents bottlenecks
✅ **Optimized Queries** - JOINs and aggregations built-in
✅ **Availability Checking** - Smart slot detection

### Functionality
✅ **Full CRUD Operations** - Create, Read, Update, Delete
✅ **Relationship Management** - Proper foreign keys
✅ **Data Validation** - Constraints at database level
✅ **Audit Trail** - Created_at and updated_at timestamps

---

## 📚 Documentation Map

Choose what you need:

**Getting Started?**
→ Read `QUICKSTART.md` (5 min read)

**Setting up the database?**
→ Read `DATABASE_SETUP.md` (detailed guide)

**Understanding the schema?**
→ Read `DATABASE_STRUCTURE.md` (complete reference)

**Need an overview?**
→ Read `DATABASE_IMPLEMENTATION.md` (executive summary)

**Following a checklist?**
→ Use `SETUP_CHECKLIST.md` (step-by-step)

---

## 💻 Using the Database in Your Code

### Example 1: Fetch User Bookings
```typescript
import { getUserBookings } from '@/lib/db-helpers';

const bookings = await getUserBookings(userId);
console.log(bookings); // Array of bookings
```

### Example 2: Check Room Availability
```typescript
import { checkRoomAvailability } from '@/lib/db-helpers';

const isAvailable = await checkRoomAvailability(
  roomId,
  '2024-03-20',
  '09:00:00',
  '12:00:00'
);
```

### Example 3: Custom Query
```typescript
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

const connection = await db.getConnection();
const [rows] = await connection.query<RowDataPacket[]>(
  'SELECT * FROM bookings WHERE user_id = ?',
  [userId]
);
connection.release();
```

---

## 🔄 Migrating from localStorage

Update your React components to use the API:

**Before:**
```typescript
const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
```

**After:**
```typescript
const [bookings, setBookings] = useState([]);
useEffect(() => {
  fetch('/api/bookings')
    .then(r => r.json())
    .then(data => setBookings(data));
}, []);
```

---

## 🧪 Demo Data Included

After setup, you have:
- **3 test users** (1 admin, 2 clients)
- **4 sample rooms** with pricing
- **2 sample bookings** (pending and confirmed)
- **2 sample contact messages**
- **2 sample staff members**
- **2 sample reviews** (5-star ratings)

Use these to test functionality without creating new data.

---

## ⚙️ Configuration Files

- **`.env.example`** - Template for environment variables
- **`scripts/init-database.sql`** - Database schema creation
- **`scripts/seed-data.sql`** - Sample data insertion
- **`scripts/setup-complete.js`** - Automated setup script
- **`lib/db.ts`** - Connection pool configuration
- **`lib/db-helpers.ts`** - 12+ helper functions

---

## 🔍 Quick Troubleshooting

### MySQL Connection Issues
```bash
# Check if MySQL is running
mysql -u root -p

# Verify credentials
echo $DB_HOST $DB_USER $DB_NAME
```

### Setup Script Failed
```bash
# Reinstall dependencies
npm install

# Run setup with verbose output
node scripts/setup-complete.js
```

### Table Not Found Error
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE one_estela_place;
node scripts/setup-complete.js
```

---

## 📈 Next Steps

### Immediate (This Week)
1. ✅ Run setup script
2. ✅ Verify database is created
3. ✅ Test API endpoints
4. ✅ Start migrating components

### Short-term (Next 2 weeks)
1. Replace all localStorage with API calls
2. Implement proper error handling
3. Add loading states to UI
4. Test all features end-to-end

### Medium-term (Next month)
1. Set up production database
2. Implement JWT authentication
3. Add email notifications
4. Build admin dashboard

### Long-term (Ongoing)
1. Monitor database performance
2. Implement caching strategy
3. Add advanced reporting
4. Scale infrastructure as needed

---

## 📞 Files You'll Reference

**For Questions About:**
- Setup process → `QUICKSTART.md`
- Database design → `DATABASE_STRUCTURE.md`
- API endpoints → `DATABASE_IMPLEMENTATION.md`
- Specific tables → `DATABASE_STRUCTURE.md`
- Helper functions → `lib/db-helpers.ts`

---

## ✨ What's Different Now

### Before (localStorage)
```typescript
const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
// ❌ Lost when browser clears
// ❌ Only on that device
// ❌ Limited storage (5-10MB)
// ❌ Not secure
```

### After (MySQL)
```typescript
const response = await fetch('/api/bookings');
const bookings = await response.json();
// ✅ Persistent across sessions
// ✅ Accessible from any device
// ✅ Unlimited storage
// ✅ Secure with authentication
// ✅ Multi-user support
// ✅ Full backup & recovery
```

---

## 🎉 You're All Set!

Your database is ready to power the One Estela Place venue booking system.

**Next:** Start the dev server and begin integrating the API endpoints into your components.

```bash
npm run dev
```

Visit `http://localhost:3000` and enjoy your new database-backed application! 🚀

---

**Questions?** Check the detailed documentation files listed above.
**Ready to deploy?** See the production section in `DATABASE_SETUP.md`.
