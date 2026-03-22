# Quick Deploy to Vercel (5 Minutes)

The fastest way to get your app online!

## Prerequisites
- GitHub account
- Vercel account (free)
- PlanetScale account (free) OR existing MySQL database

## Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/one-estela-place.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Database (2 minutes)

### Option A: PlanetScale (Recommended)

1. Go to https://planetscale.com and sign up
2. Click "Create database"
3. Name it: `one-estela-place`
4. Select region closest to you
5. Click "Create database"
6. Click "Connect" → "Create password"
7. Copy the connection details (you'll need these)

To import your data:
```bash
# Install PlanetScale CLI
# Windows: scoop install planetscale
# Mac: brew install planetscale/tap/pscale

# Login
pscale auth login

# Connect
pscale connect one-estela-place main --port 3309

# In another terminal, import
mysql -h 127.0.0.1 -P 3309 -u root < one_estela_place.sql
```

### Option B: Railway

1. Go to https://railway.app and sign up
2. Click "New Project" → "Provision MySQL"
3. Click on MySQL → "Connect" → Copy connection details
4. Use MySQL Workbench or command line to import your schema

## Step 3: Deploy to Vercel (1 minute)

1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New..." → "Project"
3. Import your `one-estela-place` repository
4. Click "Deploy" (don't configure anything yet)
5. Wait for initial deployment (will fail - that's OK!)

## Step 4: Add Environment Variables (2 minutes)

1. In Vercel, go to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```
DB_HOST=your-database-host.psdb.cloud
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=one_estela_place
DB_PORT=3306

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=estelatest1@gmail.com
SMTP_PASSWORD=your-gmail-app-password

NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

**Important:** For `NEXT_PUBLIC_API_URL`, use your actual Vercel URL (found on the project dashboard)

## Step 5: Redeploy

1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

## Step 6: Test Your Site! 🎉

1. Click "Visit" to open your live site
2. Test login with: `admin@oneestela.com` / `admin123`
3. Update your contact info in the CMS

## 🎯 Your site is now live!

**Your URLs:**
- Production: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/dashboard`

## 📝 Next Steps

1. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your domain (e.g., oneestela.com)
   - Follow DNS instructions

2. **Set Up Image Storage**
   - Current: Images stored locally (won't work on Vercel)
   - Solution: Use Cloudinary (free tier)
   - See DEPLOYMENT_GUIDE.md for setup

3. **Update Admin Credentials**
   - Login to admin dashboard
   - Go to Settings → Change Password
   - Update email and password

4. **Configure Email**
   - If using Gmail, create an App Password:
     1. Go to Google Account → Security
     2. Enable 2-Step Verification
     3. Go to App Passwords
     4. Generate password for "Mail"
     5. Use this in SMTP_PASSWORD

## 🐛 Troubleshooting

**Database connection error:**
- Check environment variables are correct
- Ensure database is accessible from Vercel's IP ranges
- For PlanetScale: Enable "Automatically copy migration data"

**Images not showing:**
- Vercel doesn't support file uploads to local storage
- Set up Cloudinary (see DEPLOYMENT_GUIDE.md)

**Build failed:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Try: `npm run build` locally first

**Email not sending:**
- Verify SMTP credentials
- Check Gmail App Password is correct
- Test with: node test-email.js (create this file)

## 💰 Cost Breakdown

- Vercel: **FREE** (Hobby plan)
- PlanetScale: **FREE** (5GB storage, 1 billion row reads/month)
- Domain: **$10-15/year** (optional)

**Total: $0/month** 🎉

## 🔄 Updating Your Site

Every time you push to GitHub, Vercel automatically deploys:

```bash
git add .
git commit -m "Update feature"
git push
```

Wait 2-3 minutes, and your changes are live!

## 📞 Need Help?

- Vercel Support: https://vercel.com/support
- PlanetScale Docs: https://planetscale.com/docs
- Check DEPLOYMENT_GUIDE.md for detailed instructions
