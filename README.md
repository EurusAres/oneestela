# One Estela Place - Event Venue Booking System

A modern, responsive web application for managing event venue bookings, built with Next.js 14, TypeScript, and MySQL.

## ✨ Features

- 🎯 **Public Website**
  - Browse event venues and office spaces
  - 360° virtual tours
  - Online booking system
  - Customer reviews
  - Responsive design (mobile, tablet, desktop)

- 👨‍💼 **Admin Dashboard**
  - Booking management
  - Payment proof review
  - Staff management
  - CMS for content editing
  - Analytics and reports
  - Customer chat system

- 🔐 **Authentication**
  - User registration with email verification
  - Secure login system
  - Password reset functionality
  - Admin and staff roles

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/one-estela-place.git
   cd one-estela-place
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   - Create MySQL database: `one_estela_place`
   - Import schema: `mysql -u root -p one_estela_place < one_estela_place.sql`

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   - Public site: http://localhost:3000
   - Admin dashboard: http://localhost:3000/dashboard
   - Default admin: `admin@oneestela.com` / `admin123`

## 📦 Deployment

### Quick Deploy (5 minutes)

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for the fastest way to deploy to Vercel + PlanetScale (free tier).

### Full Deployment Guide

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive deployment options:
- Vercel + PlanetScale (Recommended)
- Netlify + Supabase
- DigitalOcean App Platform
- Self-hosted VPS

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** MySQL
- **Authentication:** Custom JWT-based auth
- **Email:** Nodemailer
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

## 📁 Project Structure

```
one-estela-place/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard pages
│   ├── about/            # Public pages
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities
├── public/               # Static assets
│   └── uploads/          # User uploads
├── scripts/              # Database scripts
└── styles/               # Global styles
```

## 🔧 Configuration

### Environment Variables

Required environment variables (see `.env.example`):

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=one_estela_place
DB_PORT=3306

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Gmail Setup

To use Gmail for sending emails:
1. Enable 2-Step Verification in Google Account
2. Generate App Password: Google Account → Security → App Passwords
3. Use the generated password in `SMTP_PASSWORD`

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Database Setup](DATABASE_SETUP.md)
- [Admin Dashboard Guide](ADMIN_DASHBOARD_GUIDE.md)
- [CMS Setup Guide](CMS_SETUP_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Quick Deploy](QUICK_DEPLOY.md)

## 🧪 Testing

```bash
# Test database connection
node test-db-connection.js

# Test staff API
node test-staff-api.js
```

## 🔒 Security

- Passwords hashed with bcrypt
- SQL injection protection with parameterized queries
- CORS configuration
- Environment variables for sensitive data
- Email verification for new accounts
- Secure session management

## 📱 Responsive Design

The application is fully responsive and tested on:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🎨 Features Highlights

### For Customers
- Browse venues with 360° tours
- Easy booking process
- Payment proof upload
- Review submission
- Email notifications

### For Admins
- Real-time booking dashboard
- Payment verification system
- Staff management
- Content management system
- Analytics and reports
- Customer chat support

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
node test-db-connection.js

# Check MySQL is running
# Windows: services.msc → MySQL
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Email Not Sending
- Verify SMTP credentials
- Check Gmail App Password
- Ensure 2-Step Verification is enabled

## 📄 License

Private project - All rights reserved

## 👥 Support

For issues or questions:
1. Check the documentation files
2. Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. Check troubleshooting sections

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Ready to deploy?** Start with [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for the fastest deployment! 🚀
