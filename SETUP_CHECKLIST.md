# MySQL Database Setup Checklist

Complete these steps to get your database running:

## ✅ Prerequisites

- [ ] MySQL 8.0+ is installed and running
- [ ] Node.js 18+ is installed
- [ ] You have a MySQL user account with CREATE DATABASE privileges
- [ ] You know your MySQL password

## ✅ Step 1: Environment Setup

- [ ] Go to project settings (top-right menu)
- [ ] Click "Vars" section
- [ ] Add these environment variables:
  - [ ] `DB_HOST` = your database host (usually `localhost`)
  - [ ] `DB_USER` = your MySQL username (usually `root`)
  - [ ] `DB_PASSWORD` = your MySQL password
  - [ ] `DB_NAME` = `one_estela_place` (or your preferred name)
- [ ] Save all variables

## ✅ Step 2: Install Dependencies

- [ ] Open terminal in project directory
- [ ] Run: `npm install` or `pnpm install`
- [ ] Wait for installation to complete
- [ ] Verify no errors in output

## ✅ Step 3: Create Database

- [ ] Run: `node scripts/setup-complete.js`
- [ ] Watch for success message
- [ ] Database should be created with:
  - [ ] 10 tables with proper structure
  - [ ] All indexes and constraints
  - [ ] Demo data seeded

## ✅ Step 4: Verify Setup

Check that everything is working:

```bash
# Start development server
npm run dev
```

Then verify:
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] No database connection errors in console
- [ ] Page loads properly

## ✅ Step 5: Test Database Connection

Try one of these to confirm:

**Option 1: Test via MySQL client**
```bash
mysql -h localhost -u root -p
USE one_estela_place;
SHOW TABLES;
SELECT COUNT(*) FROM users;
EXIT;
```

**Option 2: Test via API**
- [ ] Create a test booking through the API
- [ ] Verify it appears in the database
- [ ] Verify responses contain correct data

## ✅ Step 6: Review Documentation

Read these files in order:
1. [ ] `QUICKSTART.md` - Quick reference
2. [ ] `DATABASE_SETUP.md` - Detailed instructions
3. [ ] `DATABASE_STRUCTURE.md` - Complete schema
4. [ ] `DATABASE_IMPLEMENTATION.md` - Overview

## ✅ Step 7: Update Frontend Components

Start migrating from localStorage to API:

- [ ] Update auth context to use `/api/auth/*` endpoints
- [ ] Update booking context to use `/api/bookings` endpoints
- [ ] Update chat to use `/api/chat` endpoints
- [ ] Update payment proofs to use `/api/payment-proofs` endpoints
- [ ] Update contact form to use `/api/contact` endpoint
- [ ] Update reviews to use `/api/reviews` endpoints

## ✅ Step 8: Test All Features

Test each major feature:

- [ ] User registration works
- [ ] User login works
- [ ] Can view available rooms
- [ ] Can create a booking
- [ ] Can submit contact form
- [ ] Can upload payment proof
- [ ] Can submit a review
- [ ] Chat functionality works
- [ ] Admin can view all bookings

## ✅ Step 9: Production Preparation

Before deploying to production:

- [ ] Set up production MySQL database
- [ ] Update environment variables in Vercel
- [ ] Set up database backup strategy
- [ ] Test all APIs in production
- [ ] Monitor database performance
- [ ] Implement proper error handling
- [ ] Add logging for debugging

## 📝 Common Issues & Solutions

### Issue: "Error: connect ECONNREFUSED"
**Solution:** 
- Check MySQL is running: `mysql -u root -p`
- Verify DB_HOST is correct
- Check DB_USER and DB_PASSWORD are correct

### Issue: "Access denied for user"
**Solution:**
- Verify DB_USER and DB_PASSWORD environment variables
- Check MySQL user has permission to create database
- Reset MySQL password if needed

### Issue: "Table already exists"
**Solution:**
- Drop existing database: `DROP DATABASE one_estela_place;`
- Run setup script again
- Or choose different DB_NAME

### Issue: "bcrypt module not found"
**Solution:**
- Run: `npm install`
- Clear node_modules: `rm -rf node_modules && npm install`

### Issue: API returns 500 error
**Solution:**
- Check server logs for error message
- Verify database is running
- Verify environment variables are set
- Check API route file for syntax errors

## 🎯 Success Criteria

You'll know everything is working when:

✅ Setup script runs successfully
✅ No console errors on page load
✅ Can create a new user account
✅ Can log in with created account
✅ Can view and create bookings
✅ Can see bookings in database
✅ All API endpoints return data
✅ Demo data is visible in app

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `DATABASE_IMPLEMENTATION.md` | Overview and summary |
| `QUICKSTART.md` | Quick start guide |
| `DATABASE_SETUP.md` | Detailed setup instructions |
| `DATABASE_STRUCTURE.md` | Complete schema documentation |
| `scripts/init-database.sql` | SQL schema definition |
| `scripts/seed-data.sql` | Demo data |
| `scripts/setup-complete.js` | Automated setup script |
| `lib/db.ts` | Database connection utility |
| `lib/db-helpers.ts` | Helper functions |
| `.env.example` | Environment variables template |

## 🚀 You're Ready!

Once this checklist is complete, you have:
✅ MySQL database configured and running
✅ 10 tables with proper schema
✅ API routes for all features
✅ Demo data for testing
✅ Helper functions for common operations
✅ Complete documentation

Start building! 🎉
