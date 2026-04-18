# 🚀 Deploy One Estela Place with Aiven MySQL

## ✅ Current Status
- ✅ Aiven MySQL database created: `one-estela-place`
- ✅ Code is ready and responsive UI implemented
- ✅ Build errors fixed
- ⏳ Database needs to be powered on and configured

## 🎯 Deployment Steps with Aiven

### Step 1: Configure Aiven Database (10 minutes)

1. **Power On Your Database**
   - In Aiven console, click "Power on" for your `one-estela-place` database
   - Wait for status to change to "Running" (2-3 minutes)

2. **Get Connection Details**
   - Click "Quick connect" button in Aiven console
   - Copy the connection information:
     ```
     Host: one-estela-place-eares223321-3924.a.aivencloud.com
     Port: 22321
     Database: defaultdb
     User: avnadmin
     Password: [your-password]
     ```

3. **Import Database Schema**
   
   **Option A: Using Aiven Console (Recommended)**
   - Go to "Query statistics" or "Current queries" in Aiven
   - Look for a query interface or console
   - Copy and paste the content from `deployment-schema.sql`
   - Execute the queries

   **Option B: Using MySQL Client**
   ```bash
   # Install MySQL client if not available
   # Windows: Download from MySQL website
   # Mac: brew install mysql-client
   
   # Connect to Aiven database
   mysql -h one-estela-place-eares223321-3924.a.aivencloud.com -P 22321 -u avnadmin -p
   
   # Create database and import schema
   source deployment-schema.sql
   ```

   **Option C: Using MySQL Workbench**
   - Download MySQL Workbench
   - Create new connection with Aiven details
   - Open `deployment-schema.sql` and execute

### Step 2: Push to GitHub (5 minutes)

```bash
# If not already done
git init
git add .
git commit -m "Ready for Aiven deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/one-estela-place.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (10 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New..." → "Project"
3. Import your `one-estela-place` repository
4. **Don't configure anything yet** - just click "Deploy"
5. Wait for initial deployment (will show errors - that's OK!)

### Step 4: Configure Environment Variables (5 minutes)

In Vercel → Settings → Environment Variables, add:

```env
DB_HOST=one-estela-place-eares223321-3924.a.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_PORT=22321
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=estelatest1@gmail.com
SMTP_PASSWORD=uthbphdsnsjmlutp
NEXT_PUBLIC_API_URL=https://your-vercel-url.vercel.app
```

**⚠️ Important Notes:**
- Replace `your-aiven-password` with your actual Aiven password
- Replace `your-vercel-url` with your actual Vercel URL
- Use `defaultdb` as the database name (Aiven's default)
- Port is `22321` (not the standard 3306)

### Step 5: Update Database Configuration (Important!)

Since Aiven uses SSL by default, update your database connection. Create/update `lib/db.ts`:

```typescript
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Required for Aiven
  },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
}

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}
```

### Step 6: Redeploy (2 minutes)

1. Commit the database configuration changes:
   ```bash
   git add .
   git commit -m "Add Aiven SSL configuration"
   git push
   ```

2. In Vercel → Deployments → Click "Redeploy" on latest deployment
3. Wait 2-3 minutes for completion

## 🎉 Your Site is Live!

**Test your deployment:**
1. Visit your Vercel URL
2. Test login with: `admin@oneestela.com` / `admin123`
3. Check database connectivity
4. Test booking flow
5. Verify admin dashboard

## 🔧 Aiven-Specific Configuration

### Database Management
- **Aiven Console:** Monitor performance, logs, and metrics
- **Backups:** Automatic daily backups included
- **Scaling:** Easy to upgrade storage/performance
- **SSL:** Always enabled (secure by default)

### Connection Troubleshooting
If you get connection errors:

1. **Check Aiven Status**
   - Ensure database is "Running" in Aiven console
   - Check for any maintenance windows

2. **Verify SSL Configuration**
   - Aiven requires SSL connections
   - Ensure `ssl: { rejectUnauthorized: false }` is in config

3. **Test Connection**
   ```bash
   # Test from command line
   mysql -h your-aiven-host -P 22321 -u avnadmin -p --ssl-mode=REQUIRED
   ```

### Performance Optimization
- **Connection Pooling:** Consider using connection pools for production
- **Indexes:** Monitor slow queries in Aiven console
- **Caching:** Add Redis if needed (Aiven also provides Redis)

## 💰 Cost with Aiven

- **Aiven MySQL:** ~$25-50/month (depending on plan)
- **Vercel:** FREE (Hobby plan)
- **Domain:** $10-15/year (optional)
- **Total:** ~$25-50/month

## 🔄 Maintenance

### Regular Tasks
- Monitor database performance in Aiven console
- Check backup status
- Review connection logs
- Update dependencies

### Scaling
- Upgrade Aiven plan as traffic grows
- Monitor storage usage
- Consider read replicas for high traffic

## 🆘 Troubleshooting

**Database connection timeout:**
- Increase connection timeout values
- Check Aiven service status
- Verify network connectivity

**SSL certificate errors:**
- Ensure SSL configuration is correct
- Use `rejectUnauthorized: false` for Aiven

**Performance issues:**
- Check Aiven metrics dashboard
- Review slow query logs
- Consider upgrading Aiven plan

## 📞 Support

- **Aiven Support:** Available in Aiven console
- **Vercel Support:** https://vercel.com/support
- **Database Issues:** Check Aiven logs and metrics

## 🎯 Success Checklist

- [ ] Aiven database powered on and running
- [ ] Database schema imported successfully
- [ ] SSL configuration added to code
- [ ] Environment variables configured in Vercel
- [ ] Site deploys without errors
- [ ] Database connection works
- [ ] Admin login successful
- [ ] Booking flow functional
- [ ] Email notifications working

## 🚀 You're Live with Aiven!

**Your URLs:**
- **Production:** `https://your-project.vercel.app`
- **Admin Dashboard:** `https://your-project.vercel.app/dashboard`
- **Database:** Managed by Aiven (secure, backed up, monitored)

**Benefits of Aiven:**
- ✅ Automatic backups
- ✅ SSL encryption
- ✅ Performance monitoring
- ✅ 99.99% uptime SLA
- ✅ Professional support

Your venue booking system is now running on enterprise-grade infrastructure! 🎉