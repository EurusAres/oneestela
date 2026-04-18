# 🚀 Deploy One Estela Place - Step by Step

## ✅ Pre-Deployment Status
- ✅ Code is ready and responsive UI is implemented
- ✅ Build errors fixed
- ✅ Database schema prepared
- ✅ Environment configuration ready

## 🎯 Quick Deploy (30 minutes)

### Step 1: Set Up Database (10 minutes)

**Choose PlanetScale (Recommended - Free):**

1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Click "Create database"
3. Name: `one-estela-place`
4. Select region closest to you
5. Click "Create database"
6. Click "Connect" → "Create password"
7. **IMPORTANT:** Copy these connection details:
   ```
   Host: xxxxxxxxx.psdb.cloud
   Username: xxxxxxxxx
   Password: xxxxxxxxx
   Database: one_estela_place
   Port: 3306
   ```

**Import Database Schema:**
1. Click "Console" in PlanetScale dashboard
2. Copy the entire content from `deployment-schema.sql` (in your project root)
3. Paste and execute in the console
4. Verify tables are created

### Step 2: Push to GitHub (5 minutes)

```bash
# If not already done
git init
git add .
git commit -m "Ready for deployment - responsive UI complete"

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

1. In Vercel, go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables one by one:

```env
DB_HOST=your-planetscale-host.psdb.cloud
DB_USER=your-planetscale-username
DB_PASSWORD=your-planetscale-password
DB_NAME=one_estela_place
DB_PORT=3306
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=estelatest1@gmail.com
SMTP_PASSWORD=uthbphdsnsjmlutp
NEXT_PUBLIC_API_URL=https://your-vercel-url.vercel.app
```

**⚠️ Important:** Replace `your-vercel-url` with your actual Vercel URL (found on project dashboard)

### Step 5: Redeploy (2 minutes)

1. Go to "Deployments" tab in Vercel
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes for completion

## 🎉 Your Site is Live!

**Test your deployment:**
1. Visit your Vercel URL
2. Test login with: `admin@oneestela.com` / `admin123`
3. Check all pages work
4. Test booking flow
5. Test admin dashboard

## 🔧 Post-Deployment Tasks

### 1. Update Admin Credentials
```bash
# Login to admin dashboard
# Go to Settings → Change Password
# Update email and password
```

### 2. Configure Custom Domain (Optional)
1. In Vercel: Settings → Domains
2. Add your domain (e.g., oneestela.com)
3. Follow DNS instructions

### 3. Set Up Image Storage (Important!)
Current setup stores images locally (won't work on Vercel). Options:

**Option A: Cloudinary (Recommended)**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Update upload API to use Cloudinary

**Option B: Vercel Blob Storage**
1. Enable in Vercel dashboard
2. Update upload API

## 🐛 Troubleshooting

**Database connection error:**
- Verify environment variables are correct
- Check PlanetScale database is active
- Ensure connection string format is correct

**Build failed:**
- Check build logs in Vercel
- Verify all dependencies in package.json
- Check for TypeScript errors

**Images not showing:**
- Expected behavior on Vercel (local storage doesn't work)
- Set up Cloudinary or Vercel Blob storage

**Email not working:**
- Verify SMTP credentials
- Check Gmail app password is correct
- Test email functionality

## 💰 Cost Breakdown

- **Vercel:** FREE (Hobby plan)
- **PlanetScale:** FREE (5GB storage)
- **Domain:** $10-15/year (optional)
- **Total:** $0/month 🎉

## 🔄 Future Updates

Every time you push to GitHub, Vercel automatically deploys:

```bash
git add .
git commit -m "Update feature"
git push
```

## 📞 Need Help?

1. Check Vercel deployment logs
2. Check PlanetScale connection
3. Verify environment variables
4. Test locally first: `npm run dev`

## 🎯 Success Checklist

- [ ] Database created and schema imported
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Environment variables configured
- [ ] Site loads without errors
- [ ] Admin login works
- [ ] Booking flow works
- [ ] Email notifications work (test)
- [ ] Mobile responsive (test on phone)
- [ ] Admin dashboard accessible

## 🚀 You're Live!

**Your URLs:**
- **Production:** `https://your-project.vercel.app`
- **Admin Dashboard:** `https://your-project.vercel.app/dashboard`
- **Login:** Use `admin@oneestela.com` / `admin123`

**Next Steps:**
1. Update admin password
2. Add your content via CMS
3. Test all features
4. Share with stakeholders!

---

**Deployment completed!** 🎉 Your venue booking system is now live and ready for customers.