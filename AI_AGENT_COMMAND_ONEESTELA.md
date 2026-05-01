# 🤖 AI Agent Command — One Estela Place (`EurusAres/oneestela`)

> **Project:** One Estela Place — Venue & Office Room Booking Platform  
> **Stack:** Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · MySQL · Recharts · react-hook-form/Zod · Nodemailer · bcrypt  
> **Repo:** https://github.com/EurusAres/oneestela  
> **Issued by:** Project owner (Nelu)  
> **Priority Order:** 🔴 Critical → 🟠 High → 🟡 Medium → 🟢 Low

---

## ⚠️ BEFORE YOU TOUCH ANY CODE — CRITICAL SECURITY FIX

### 🔴 PRIORITY 0 — Remove `.env` from Git history

The file `.env` with live database credentials is committed to the public repository. Do this **first**, before any other task.

```bash
# 1. Purge .env from entire git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Force push all branches
git push origin --force --all
git push origin --force --tags

# 3. Verify .env is in .gitignore (it should already be)
grep ".env" .gitignore
```

Then **immediately rotate all credentials** — MySQL password, email SMTP password, any session secrets — because they are already public.

---

## 🟠 PHASE 1 — Performance Optimizations (Load Time)

### 1.1 Fix `next.config.mjs` — Enable Image Optimization

**Current (broken):**
```js
images: { unoptimized: true }
```

**Replace with:**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix TS errors instead of hiding them
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 1080, 1200, 1920],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
}
export default nextConfig
```

- Everywhere in the codebase that uses `<img>` tags, convert to Next.js `<Image>` from `next/image` with explicit `width`, `height`, and `priority` on above-the-fold images.

---

### 1.2 Database Connection Pooling (`lib/db.ts` or equivalent)

Find the MySQL connection setup and ensure it uses a **connection pool**, not a new connection per request.

**Replace any `mysql2.createConnection(...)` pattern with:**
```ts
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
})

export default pool
```

All API routes must use `pool.execute(...)` or `pool.query(...)` instead of individual `connection.query` + `connection.end()`.

---

### 1.3 API Route Caching Headers

In every `app/api/` route file that serves mostly-static or slowly-changing data (e.g., venue listings, office rooms), add cache headers:

```ts
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
})
```

For mutation routes (bookings POST/PUT/DELETE), add:
```ts
'Cache-Control': 'no-store'
```

---

### 1.4 Dashboard Stats — Add `revalidate` to Server Components

In `app/dashboard/page.tsx` (or wherever stats are fetched), use Next.js ISR:

```ts
export const revalidate = 30 // refresh every 30 seconds server-side
```

This replaces the current client-side 30-second auto-refresh `setInterval` polling pattern and is far more efficient.

---

### 1.5 Add `loading.tsx` Skeleton Files

Create `loading.tsx` in every route segment that lacks one. This gives instant perceived performance.

**Segments that need it:**
- `app/loading.tsx`
- `app/dashboard/loading.tsx`
- `app/dashboard/bookings/loading.tsx`
- `app/booking/loading.tsx`

**Template:**
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
```

---

### 1.6 Lazy Load Heavy Components

Recharts charts and any modal/dialog components should be dynamically imported:

```ts
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
})

const BookingDetailModal = dynamic(() => import('@/components/BookingDetailModal'), {
  ssr: false,
})
```

---

### 1.7 Optimize Database Queries

For every `SELECT *` query in API routes, list only needed columns explicitly. Add indexes to the MySQL database for common lookup columns:

```sql
-- Run these on your MySQL database
ALTER TABLE bookings ADD INDEX idx_status (status);
ALTER TABLE bookings ADD INDEX idx_created_at (created_at);
ALTER TABLE bookings ADD INDEX idx_user_id (user_id);
ALTER TABLE reviews ADD INDEX idx_approved (is_approved);
ALTER TABLE messages ADD INDEX idx_is_read (is_read);
```

Also add these to `one_estela_place.sql` so they're present on fresh setups.

---

## 🟡 PHASE 2 — Full Responsive UI (All Screen Sizes)

### Breakpoint Reference (Tailwind CSS)

| Prefix | Min-width | Target Devices |
|--------|-----------|----------------|
| (none) | 0px | Mobile portrait (≤ 360px) |
| `sm:` | 640px | Mobile landscape / large phone |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Tablet landscape / small laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide desktop |

---

### 2.1 Global Layout & Navigation

**File:** `components/layout/Sidebar.tsx` (or equivalent nav component)

- On mobile (`< lg`): Sidebar must be **hidden by default**, toggled by a hamburger button using `useState`.
- On desktop (`lg:`): Sidebar is always visible, fixed on the left.
- Use `Sheet` from shadcn/ui for the mobile drawer sidebar.

**Pattern:**
```tsx
<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">
  <SidebarContent />
</aside>

{/* Mobile: Sheet/Drawer */}
<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  <SheetContent side="left" className="w-64 p-0">
    <SidebarContent />
  </SheetContent>
</Sheet>

{/* Mobile top bar with hamburger */}
<header className="lg:hidden flex items-center justify-between p-4 border-b">
  <button onClick={() => setMobileOpen(true)}><Menu /></button>
  <span className="font-semibold">One Estela Place</span>
</header>
```

The main content area must offset for sidebar on desktop:
```tsx
<main className="lg:pl-64 min-h-screen">
```

---

### 2.2 Dashboard KPI Cards

**File:** `app/dashboard/page.tsx` or `components/dashboard/StatsCards.tsx`

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4 md:p-6">
  {/* Each KPI card */}
  <Card className="p-4 md:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Total Bookings</p>
        <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
      </div>
      <CalendarIcon className="h-8 w-8 text-primary opacity-80" />
    </div>
  </Card>
</div>
```

---

### 2.3 Recharts — Make Charts Responsive

All chart components must use `ResponsiveContainer` from Recharts. Find every chart file and wrap:

```tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
    <YAxis tick={{ fontSize: 11 }} />
    <Tooltip />
    <Legend />
    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
  </BarChart>
</ResponsiveContainer>
```

On small screens, hide the `Legend` or reduce margins using the Recharts `<Customized>` component or conditional rendering based on `useWindowWidth` hook.

---

### 2.4 Bookings Table — Mobile-Friendly

**File:** `app/dashboard/bookings/page.tsx` (or BookingsTable component)

Tables break on mobile. Use this pattern: full table on `md+`, card list on mobile.

```tsx
{/* Desktop table */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full text-sm">
    {/* ... full table with all columns ... */}
  </table>
</div>

{/* Mobile card list */}
<div className="md:hidden space-y-3 p-4">
  {bookings.map(booking => (
    <Card key={booking.id} className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{booking.customer_name}</p>
          <p className="text-sm text-muted-foreground">{booking.venue_name}</p>
          <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
        </div>
        <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" onClick={() => handleView(booking)}>View</Button>
        {booking.status === 'pending' && (
          <Button size="sm" onClick={() => handleConfirm(booking.id)}>Confirm</Button>
        )}
      </div>
    </Card>
  ))}
</div>
```

---

### 2.5 Booking Form — Public Page

**File:** `app/booking/page.tsx` or `components/BookingForm.tsx`

```tsx
<div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
  <Card className="w-full max-w-lg md:max-w-2xl">
    <CardHeader className="p-4 md:p-6">
      <CardTitle className="text-xl md:text-2xl">Book a Space</CardTitle>
    </CardHeader>
    <CardContent className="p-4 md:p-6 pt-0">
      <form className="space-y-4">
        {/* 2-column grid on md+, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="firstName" label="First Name" />
          <FormField name="lastName" label="Last Name" />
        </div>
        <FormField name="email" label="Email Address" type="email" />
        <FormField name="phone" label="Phone Number" type="tel" />
        {/* Date/time and room selects full width */}
        <FormField name="room" label="Select Room" component="select" />
        <FormField name="date" label="Booking Date" type="date" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="startTime" label="Start Time" type="time" />
          <FormField name="endTime" label="End Time" type="time" />
        </div>
        <Button type="submit" className="w-full">Request Booking</Button>
      </form>
    </CardContent>
  </Card>
</div>
```

---

### 2.6 Homepage / Landing Page

**File:** `app/page.tsx`

- Hero section: stacked on mobile, side-by-side on `lg:`.
- Venue/room cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`
- Navigation bar: hamburger menu on mobile using shadcn Sheet or a collapsible.
- CTA buttons: `w-full sm:w-auto`
- Font sizes: use responsive typography `text-3xl md:text-5xl lg:text-6xl`

---

### 2.7 Login / Auth Pages

**File:** `app/login/page.tsx`, `app/register/page.tsx`

```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <Card className="w-full max-w-sm md:max-w-md shadow-lg">
    <CardHeader className="text-center pb-2">
      <CardTitle className="text-2xl">Welcome Back</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Form fields */}
    </CardContent>
  </Card>
</div>
```

---

### 2.8 Add Global Responsive Typography

**File:** `app/globals.css` or `tailwind.config.ts`

Add a fluid type scale in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    fontSize: {
      'fluid-sm': 'clamp(0.875rem, 2vw, 1rem)',
      'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
      'fluid-lg': 'clamp(1.125rem, 3vw, 1.5rem)',
      'fluid-xl': 'clamp(1.5rem, 4vw, 2.25rem)',
      'fluid-2xl': 'clamp(2rem, 6vw, 3.5rem)',
    }
  }
}
```

---

### 2.9 Touch Targets — Mobile Accessibility

All interactive elements on mobile must have a minimum touch target of 44×44px. Apply these classes globally:

```css
/* In globals.css */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}
```

Or use Tailwind: `className="min-h-[44px] px-4"` on all buttons.

---

## 🟢 PHASE 3 — Code Quality & Architecture

### 3.1 Fix TypeScript — Stop Ignoring Build Errors

In `next.config.mjs`, the `ignoreBuildErrors: true` flag was hiding real bugs. Set it to `false` (done in Phase 1.1) and fix all TypeScript errors one by one. Prioritize:
- Missing types on API response objects
- `any` types in form handlers
- Untyped MySQL query results

Create `types/index.ts` with shared interfaces:
```ts
export interface Booking {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  venue_name: string
  room_id: number
  booking_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined'
  total_amount: number
  created_at: string
}

export interface Review {
  id: number
  customer_name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  is_read: boolean
  replied_at: string | null
  created_at: string
}
```

---

### 3.2 Consolidate CMS Storage

The CMS currently has a dual-storage inconsistency (localStorage + MySQL). **Eliminate localStorage** as the source of truth. All CMS data must read/write exclusively through API routes that talk to MySQL. localStorage may only be used for non-critical UI state (e.g., sidebar open/closed preference).

---

### 3.3 Add `.gitignore` Entry Verification

Ensure `.gitignore` contains:
```
.env
.env.local
.env.*.local
node_modules/
.next/
```

---

### 3.4 Consolidate Test Scripts

The root-level `test-*.js` files are disorganized. Move them to a `scripts/` folder and add npm script aliases:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:setup": "node scripts/setup-complete.js",
  "db:seed": "node scripts/seed-bookings.js",
  "db:check": "node scripts/check-db.js",
  "db:reset-admin": "node scripts/reset-admin-password.js"
}
```

---

## 📋 Execution Checklist

Work through tasks in this order. Mark each `[x]` when done.

```
CRITICAL (Do first)
[ ] 0.1 Remove .env from git history and rotate all credentials

PERFORMANCE
[ ] 1.1 Fix next.config.mjs (image optimization, remove ignoreBuildErrors)
[ ] 1.2 Implement MySQL connection pooling
[ ] 1.3 Add cache headers to API routes
[ ] 1.4 Add ISR revalidate to dashboard server components
[ ] 1.5 Add loading.tsx skeletons to all route segments
[ ] 1.6 Lazy-load Recharts and dialog/modal components
[ ] 1.7 Add MySQL indexes for common queries

RESPONSIVE UI
[ ] 2.1 Make sidebar into Sheet/Drawer on mobile
[ ] 2.2 Make KPI cards responsive grid
[ ] 2.3 Wrap all charts in ResponsiveContainer
[ ] 2.4 Convert bookings table to card list on mobile
[ ] 2.5 Make booking form fully responsive
[ ] 2.6 Make homepage responsive (hero, cards, nav)
[ ] 2.7 Make login/register pages centered & responsive
[ ] 2.8 Add fluid typography scale to tailwind config
[ ] 2.9 Ensure 44px touch targets on all interactive elements

CODE QUALITY
[ ] 3.1 Fix all TypeScript errors now that ignoreBuildErrors is false
[ ] 3.2 Eliminate localStorage from CMS, use MySQL only
[ ] 3.3 Verify .gitignore entries
[ ] 3.4 Consolidate test scripts under scripts/ folder
```

---

## 🧪 Testing After Changes

After completing all phases, test against these breakpoints in browser DevTools:

| Device | Width | What to check |
|--------|-------|---------------|
| iPhone SE | 375px | Mobile nav, booking form, card lists |
| iPhone 14 Pro | 393px | Same as above |
| iPad Mini | 768px | Tablet layout, sidebar state |
| iPad Pro | 1024px | Desktop sidebar appears |
| MacBook 13" | 1280px | Full dashboard layout |
| Desktop | 1920px | No layout overflow |

**Lighthouse targets after optimization:**
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- First Contentful Paint: < 2s
- Time to Interactive: < 3.5s

---

*End of AI Agent Command — One Estela Place*
