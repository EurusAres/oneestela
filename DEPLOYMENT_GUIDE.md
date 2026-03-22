# One Estela Place - Deployment Guide

This guide covers deploying your Next.js application with MySQL database to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
- [ ] All code committed to a Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Database schema and data ready
- [ ] Environment variables documented
- [ ] Tested the application locally
- [ ] Responsive UI working on all devices

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js) + PlanetScale/Railway

**Best for:** Quick deployment, automatic CI/CD, serverless

#### Step 1: Prepare Your Database

**Option A: PlanetScale (MySQL-compatible, free tier)**

1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database
3. Click "Connect" and copy the connection string
4. Import your schema:
   ```bash
   # Install PlanetScale CLI
   # Windows (using Scoop)
   scoop install planetscale
   
   # Or download from: https://github.com/planetscale/cli
   
   # Login
   pscale auth login
   
   # Connect to your database
   pscale connect one-estela-place main --port 3309
   
   # In another terminal, import your schema
   mysql -h 127.0.0.1 -P 3309 -u root < one_estela_place.sql
   ```

**Option B: Railway (MySQL, free tier with credit)**

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Add MySQL database
4. Copy the connection details
5. Use the provided connection URL to import your schema

#### Step 2: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/one-estela-place.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `DB_HOST` - Your database host
   - `DB_USER` - Your database user
   - `DB_PASSWORD` - Your database password
   - `DB_NAME` - Your database name
   - `DB_PORT` - Your database port (usually 3306)
   - `SMTP_HOST` - Your email SMTP host
   - `SMTP_PORT` - Your email SMTP port
   - `SMTP_USER` - Your email address
   - `SMTP_PASSWORD` - Your email app password
   - `NEXT_PUBLIC_API_URL` - Your Vercel deployment URL (e.g., https://one-estela-place.vercel.app)

6. Click "Deploy"
7. Wait for deployment to complete (2-5 minutes)
8. Visit your live site!

**Cost:** Free tier available (Vercel + PlanetScale/Railway)

---

### Option 2: Netlify + Supabase

**Best for:** Alternative to Vercel, good free tier

#### Step 1: Convert to Supabase (PostgreSQL)

Since Supabase uses PostgreSQL instead of MySQL, you'll need to:
1. Convert your MySQL schema to PostgreSQL
2. Or use a MySQL-compatible service (see Option 1)

#### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables (same as Vercel)
5. Deploy

**Cost:** Free tier available

---

### Option 3: DigitalOcean App Platform

**Best for:** More control, managed hosting

#### Step 1: Set Up Database

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create a Managed MySQL Database ($15/month)
3. Note the connection details
4. Import your schema using the provided connection string

#### Step 2: Deploy Application

1. Create a new App
2. Connect your GitHub repository
3. Configure:
   - Environment: Node.js
   - Build command: `npm run build`
   - Run command: `npm start`
4. Add environment variables
5. Deploy

**Cost:** ~$20/month (App + Database)

---

### Option 4: Self-Hosted VPS (DigitalOcean/Linode/AWS)

**Best for:** Full control, custom configuration

#### Requirements:
- VPS with at least 2GB RAM
- Ubuntu 22.04 LTS
- Domain name (optional but recommended)

#### Step-by-Step Setup:

1. **Create a VPS**
   - DigitalOcean Droplet ($6/month)
   - Linode ($5/month)
   - AWS EC2 (t2.micro free tier)

2. **Connect to your server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js and MySQL**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   
   # Install MySQL
   apt install -y mysql-server
   
   # Secure MySQL
   mysql_secure_installation
   
   # Install PM2 (process manager)
   npm install -g pm2
   
   # Install Nginx (web server)
   apt install -y nginx
   ```

4. **Set up MySQL database**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE one_estela_place;
   CREATE USER 'estela_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON one_estela_place.* TO 'estela_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```
   
   Import your schema:
   ```bash
   mysql -u estela_user -p one_estela_place < one_estela_place.sql
   ```

5. **Deploy your application**
   ```bash
   # Create app directory
   mkdir -p /var/www/one-estela-place
   cd /var/www/one-estela-place
   
   # Clone your repository
   git clone https://github.com/yourusername/one-estela-place.git .
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   ```
   
   Add your environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=estela_user
   DB_PASSWORD=your_secure_password
   DB_NAME=one_estela_place
   DB_PORT=3306
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=estelatest1@gmail.com
   SMTP_PASSWORD=your_app_password
   NEXT_PUBLIC_API_URL=http://your-domain.com
   ```
   
   Build and start:
   ```bash
   npm run build
   pm2 start npm --name "one-estela-place" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/one-estela-place
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable the site:
   ```bash
   ln -s /etc/nginx/sites-available/one-estela-place /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Set up SSL (HTTPS)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

**Cost:** ~$6-12/month

---

## 🔒 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Use environment variables (never commit .env)
- [ ] Enable CORS only for your domain
- [ ] Set up database backups
- [ ] Update admin email and credentials
- [ ] Test all authentication flows
- [ ] Review file upload security

---

## 📁 File Upload Configuration

Your app stores uploads in `/public/uploads/`. For production:

**Option A: Keep local storage (VPS only)**
- Ensure `/public/uploads/` has write permissions
- Set up regular backups

**Option B: Use cloud storage (Recommended for Vercel/Netlify)**
1. Set up Cloudinary, AWS S3, or DigitalOcean Spaces
2. Update `app/api/upload/route.ts` to use cloud storage
3. Update image URLs throughout the app

---

## 🗄️ Database Backup

**Automated backups:**

```bash
# Create backup script
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

mysqldump -u estela_user -p'your_password' one_estela_place > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

---

## 🔄 Continuous Deployment

**For Vercel/Netlify:**
- Automatic deployment on git push to main branch
- Preview deployments for pull requests

**For VPS:**
Create a deployment script:

```bash
nano /var/www/one-estela-place/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/one-estela-place
git pull origin main
npm install
npm run build
pm2 restart one-estela-place
```

```bash
chmod +x deploy.sh
```

---

## 📊 Monitoring

**Free monitoring tools:**
- Vercel Analytics (built-in)
- Google Analytics
- UptimeRobot (uptime monitoring)
- PM2 monitoring (for VPS)

---

## 🆘 Troubleshooting

**Database connection issues:**
```bash
# Test database connection
node test-db-connection.js
```

**Application not starting:**
```bash
# Check logs
pm2 logs one-estela-place

# Restart application
pm2 restart one-estela-place
```

**Nginx issues:**
```bash
# Check Nginx status
systemctl status nginx

# Check error logs
tail -f /var/log/nginx/error.log
```

---

## 📞 Post-Deployment

1. Test all features:
   - User registration and login
   - Booking flow
   - Payment proof upload
   - Admin dashboard
   - Email verification
   - 360° virtual tour

2. Update contact information in CMS

3. Set up monitoring and alerts

4. Create admin account:
   ```bash
   node update-staff-password.js
   ```

5. Share the URL with stakeholders!

---

## 💡 Recommended Setup for Beginners

**Easiest & Free:**
1. Deploy to Vercel (frontend)
2. Use PlanetScale (database)
3. Use Cloudinary (image uploads)

**Total cost:** $0/month (free tiers)
**Setup time:** 30 minutes

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

---

Need help? Check the troubleshooting section or create an issue in your repository.
