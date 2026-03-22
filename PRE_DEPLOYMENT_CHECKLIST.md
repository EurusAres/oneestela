# Pre-Deployment Checklist

Complete this checklist before deploying to production.

## ✅ Code & Repository

- [ ] All code committed to Git
- [ ] `.env` file is in `.gitignore` (never commit secrets!)
- [ ] `.env.example` is up to date with all required variables
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or API keys
- [ ] All TODO comments resolved or documented
- [ ] Code builds successfully: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

## ✅ Database

- [ ] Database schema is finalized
- [ ] All migrations are applied
- [ ] Sample/test data removed (run `remove_dummy_data.sql` if needed)
- [ ] Database backup created
- [ ] Database credentials are secure
- [ ] Database is accessible from deployment platform
- [ ] Indexes are optimized for production queries

## ✅ Environment Variables

- [ ] All environment variables documented in `.env.example`
- [ ] Production database credentials ready
- [ ] SMTP email credentials configured
- [ ] `NEXT_PUBLIC_API_URL` set to production URL
- [ ] No development URLs in environment variables

## ✅ Security

- [ ] Default admin password changed
- [ ] All staff passwords are strong
- [ ] Database password is strong (16+ characters)
- [ ] SMTP password is an app-specific password (not main password)
- [ ] File upload validation is in place
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CORS configured for production domain only

## ✅ Content & Configuration

- [ ] Contact information updated (phone, email, address)
- [ ] Business hours updated
- [ ] About page content reviewed
- [ ] Terms and conditions added
- [ ] Privacy policy added (if collecting user data)
- [ ] Logo and branding images uploaded
- [ ] Venue images uploaded
- [ ] 360° tour images uploaded (if available)

## ✅ Email Configuration

- [ ] SMTP credentials tested
- [ ] Email verification works
- [ ] Password reset emails work
- [ ] Booking confirmation emails work
- [ ] Email templates reviewed for branding
- [ ] Sender email address is professional

## ✅ Testing

- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Booking flow works end-to-end
- [ ] Payment proof upload works
- [ ] Admin dashboard accessible
- [ ] All admin features tested
- [ ] Mobile responsive design tested
- [ ] Tablet responsive design tested
- [ ] Desktop responsive design tested
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## ✅ Performance

- [ ] Images optimized (compressed)
- [ ] Large files removed from repository
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Caching strategy implemented (if needed)

## ✅ Deployment Platform

- [ ] Deployment platform account created
- [ ] Payment method added (if required)
- [ ] Domain name purchased (if using custom domain)
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate configured (HTTPS)
- [ ] Environment variables added to platform
- [ ] Build settings configured

## ✅ Monitoring & Backup

- [ ] Error monitoring set up (optional but recommended)
- [ ] Uptime monitoring configured
- [ ] Database backup strategy in place
- [ ] File backup strategy in place (for uploads)
- [ ] Analytics configured (Google Analytics, Vercel Analytics, etc.)

## ✅ Documentation

- [ ] README.md updated with deployment info
- [ ] Admin credentials documented securely
- [ ] API documentation updated (if applicable)
- [ ] Deployment process documented
- [ ] Rollback procedure documented

## ✅ Post-Deployment

- [ ] Production URL accessible
- [ ] HTTPS working (green padlock)
- [ ] All pages load correctly
- [ ] No console errors in browser
- [ ] Test user registration on production
- [ ] Test booking on production
- [ ] Test admin login on production
- [ ] Email notifications working
- [ ] Mobile site working
- [ ] Custom domain working (if configured)

## ✅ Legal & Compliance

- [ ] Privacy policy added (if collecting personal data)
- [ ] Terms of service added
- [ ] Cookie consent (if using cookies)
- [ ] GDPR compliance (if serving EU users)
- [ ] Data retention policy defined

## 🚀 Ready to Deploy!

Once all items are checked:

1. **For Quick Deploy (Vercel):**
   - Follow [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

2. **For Full Deployment:**
   - Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📝 Deployment Notes

**Date:** _________________

**Deployed by:** _________________

**Deployment platform:** _________________

**Production URL:** _________________

**Database host:** _________________

**Issues encountered:** 
_________________
_________________
_________________

**Resolution:**
_________________
_________________
_________________

## 🆘 Emergency Contacts

**Developer:** _________________

**Database Admin:** _________________

**Hosting Support:** _________________

**Domain Registrar:** _________________

---

**Remember:** Always test in a staging environment before deploying to production!
