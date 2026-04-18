# One Estela Place — Responsive UI Script for AI
> **Purpose:** Hand this document to an AI coding assistant (Cursor, GitHub Copilot, Claude Code, etc.) to make every UI screen in the One Estela Place Next.js project fully responsive across mobile (≥ 320 px), tablet (≥ 768 px), and desktop (≥ 1024 px).

---

## Project Overview

**One Estela Place** is a venue-booking web application built with:
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Architecture:** Two layout shells — `PublicLayout` (customer-facing) and `MainLayout` (admin/staff dashboard with sidebar)

### Directory Map (source files only)
```
oneestela/
├── app/
│   ├── page.tsx                        # Homepage
│   ├── about/page.tsx                  # About page
│   ├── contact/page.tsx                # Contact page
│   ├── faqs/page.tsx                   # FAQs page
│   ├── reviews/page.tsx                # Reviews page
│   ├── customer-reviews/page.tsx       # Public reviews page
│   ├── content/page.tsx                # Content page
│   ├── users/page.tsx                  # Admin: Users info
│   ├── calendar/page.tsx               # Admin: Booking calendar
│   └── dashboard/
│       ├── page.tsx                    # Admin: Dashboard overview
│       ├── bookings/page.tsx           # Admin: Booking management
│       ├── chat/page.tsx               # Admin: Customer chat
│       ├── cms/page.tsx                # Admin: CMS
│       ├── messages/page.tsx           # Admin: Messages
│       ├── payments/page.tsx           # Admin: Payment verification
│       ├── reports/page.tsx            # Admin: Business reports
│       └── staff/page.tsx              # Admin: Staff management
├── components/
│   ├── public-layout.tsx               # Public nav + footer
│   ├── main-layout.tsx                 # Admin sidebar layout
│   ├── reserve-dialog.tsx              # Booking modal
│   ├── chat-widget.tsx                 # Customer chat widget
│   ├── available-spaces-section.tsx    # Venue/room cards
│   ├── featured-reviews-section.tsx    # Review cards
│   ├── payment-proof-upload.tsx        # File upload dialog
│   ├── transactions-dialog.tsx         # Booking history dialog
│   ├── cms-homepage-editor.tsx         # CMS editor
│   ├── cms-venue-editor.tsx            # Venue editor
│   ├── cms-office-room-editor.tsx      # Office room editor
│   ├── virtual-tour.tsx                # Panoramic tour viewer
│   ├── admin-chat-panel.tsx            # Admin chat panel
│   ├── unified-chat-widget.tsx         # Unified chat widget
│   └── ...other dialogs and contexts
└── globals.css
```

---

## Breakpoint System (Tailwind defaults — do not change)

| Breakpoint | Prefix | Min-width |
|------------|--------|-----------|
| Mobile     | *(default — no prefix)* | 0 px |
| Small      | `sm:` | 640 px |
| Medium     | `md:` | 768 px |
| Large      | `lg:` | 1024 px |
| Extra-large| `xl:` | 1280 px |

---

## Global Responsive Rules (apply everywhere)

1. **Containers** — always use `container mx-auto px-4` (never hardcode pixel widths).
2. **Text scaling** — body copy stays `text-sm` on mobile → `text-base` on `md:`. Headings scale: `text-xl` → `md:text-2xl` → `lg:text-3xl`.
3. **Stacking** — flex rows must collapse: `flex-col` default → `sm:flex-row` or `md:flex-row`.
4. **Buttons** — `w-full` on mobile → `sm:w-auto` on larger screens, except icon-only buttons.
5. **Grids** — default `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3` or `lg:grid-cols-4` as appropriate.
6. **Dialogs / Modals** — `DialogContent` must use `w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto`.
7. **Tables** — wrap in `<div className="overflow-x-auto w-full">` and add `min-w-[600px]` to the `<table>`.
8. **Charts (Recharts)** — wrap in `<div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">` with `<ResponsiveContainer width="100%" height="100%">`.
9. **Spacing** — use responsive padding: `py-8 md:py-12 lg:py-16`, `px-4 md:px-6`.
10. **Hide/show** — use `hidden md:block` / `md:hidden` pairs, never `display: none` inline styles.
11. **Overflow** — any scrollable panel must have `overflow-y-auto` or `overflow-x-auto`; never let content bleed.
12. **Touch targets** — minimum `h-10 w-10` for all interactive elements on mobile.

---

## File-by-File Instructions

---

### 1. `components/public-layout.tsx` — Public Navbar & Footer

**Current issues to fix:**
- Logo may overflow on small phones (`text-2xl` is fine, but verify it doesn't push the hamburger off-screen).
- Ensure the mobile menu (`isMobileMenuOpen` block) fills the full viewport width with `w-full` on its container.
- Footer grid: currently `sm:grid-cols-2 lg:grid-cols-4` — this is already correct, verify padding is `py-8 md:py-12`.
- Floating review button position: `bottom-20 md:bottom-24 right-4 md:right-6` — already responsive, keep it.

**Required changes:**
```tsx
// Header inner container — keep items from overflowing
<div className="flex h-16 items-center justify-between gap-2">

// Logo — prevent wrapping on very small screens
<Link href="/" className="text-xl sm:text-2xl font-bold text-black truncate max-w-[160px] sm:max-w-none">
  One Estela Place
</Link>

// Mobile menu panel — ensure full-width, scrollable
{isMobileMenuOpen && (
  <div className="border-t py-4 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
    {/* existing nav content */}
  </div>
)}

// Footer grid — ensure gap is responsive
<div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

---

### 2. `components/main-layout.tsx` — Admin Dashboard Layout

**Current issues to fix:**
- `pt-16 lg:pt-0` on main content already handles the fixed mobile header — keep it.
- The Sheet (mobile drawer) should have `className="overflow-y-auto"` on its inner nav.
- Main content area needs `min-w-0` and `overflow-x-hidden` to prevent sidebar overflow on mid-size screens.

**Required changes:**
```tsx
// Main content wrapper
<div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-white pt-16 lg:pt-0">
  <main className="p-4 md:p-6 lg:p-8">{children}</main>
</div>

// Mobile header title — truncate long names
<h1 className="text-base sm:text-lg font-bold truncate">One Estela Place</h1>

// Sheet nav scroll
<nav className="flex-1 space-y-1 p-4 overflow-y-auto">
  {/* menu items */}
</nav>
```

---

### 3. `app/page.tsx` — Homepage

**Status:** Already has strong responsive classes. Review and confirm these are present:

```tsx
// Hero section
<section className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] ...">

// Hero heading
<h1 className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl font-bold ...">

// Hero button row — MUST stack on mobile
<div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
  <Button className="w-full sm:w-auto" ...>Book Your Event</Button>
  <Button className="w-full sm:w-auto" ...>Take a Tour</Button>
</div>

// Feature cards grid
<div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

// CTA section buttons — same flex-col → sm:flex-row pattern
<div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
  {/* 3 buttons, each w-full sm:w-auto */}
</div>
```

---

### 4. `app/about/page.tsx` — About Page

**Required changes:**

```tsx
// Stats grid — 2 cols on mobile, 4 on lg
<div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">

// Card text scaling
<CardTitle className="text-lg md:text-xl lg:text-2xl font-bold">

// Team/story section
<div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">

// Images — always full-width within their column
<img className="w-full h-48 md:h-64 object-cover rounded-lg" .../>

// Padding
<div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
```

---

### 5. `app/contact/page.tsx` — Contact Page

**Required changes:**

```tsx
// Page wrapper
<div className="container mx-auto px-4 py-8 md:py-12">

// Heading block
<h1 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Contact Us</h1>

// Contact info grid — stack on mobile
<div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">

// Contact cards — ensure icon + text don't overflow
<div className="flex items-start gap-3 p-4 md:p-6">
  <MapPin className="h-5 w-5 md:h-6 md:w-6 mt-0.5 flex-shrink-0 text-amber-700" />
  <div className="min-w-0">  {/* prevents text overflow */}
    <p className="text-sm md:text-base break-words">{contactInfo.location}</p>
  </div>
</div>

// Contact form fields — full width on all screens
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
  <div className="sm:col-span-2"> {/* Full-width for message textarea */}
    <Textarea className="min-h-[120px] md:min-h-[150px]" />
  </div>
</div>
```

---

### 6. `app/faqs/page.tsx` — FAQs Page

**Required changes:**

```tsx
// Container
<div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">

// Page title
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">

// Accordion items — text scaling
<AccordionTrigger className="text-sm md:text-base font-medium text-left">
<AccordionContent className="text-sm md:text-base text-gray-600">

// CTA button at bottom
<Button className="w-full sm:w-auto">Contact Us</Button>
```

---

### 7. `app/reviews/page.tsx` & `app/customer-reviews/page.tsx` — Reviews Pages

**Required changes:**

```tsx
// Reviews grid
<div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Review card — prevent star rating overflow on tiny screens
<div className="flex items-center gap-1 flex-wrap">
  {/* star icons */}
</div>

// Review text — limit height with expansion toggle
<p className="text-sm md:text-base text-gray-600 line-clamp-4 md:line-clamp-none">

// Filter/sort controls — stack on mobile
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

---

### 8. `app/dashboard/page.tsx` — Admin Dashboard Overview

**Required changes:**

```tsx
// Stats cards — 2 cols on sm, 4 on lg
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

// Each stat card value text
<div className="text-xl md:text-2xl font-bold">

// Monthly chart — REQUIRED: responsive height
<div id="monthly-chart" className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={...}>
      {/* axes: hide labels on mobile using tick with custom component */}
      <XAxis tick={{ fontSize: 10 }} interval="preserveStartEnd" />
      <YAxis tick={{ fontSize: 10 }} width={40} />
    </AreaChart>
  </ResponsiveContainer>
</div>

// Recent bookings table — wrap for horizontal scroll
<div className="overflow-x-auto w-full rounded-lg border">
  <table className="w-full min-w-[640px]">
    {/* table content */}
  </table>
</div>

// "View all" buttons
<Button variant="outline" className="w-full sm:w-auto">View All Bookings</Button>
```

---

### 9. `app/dashboard/bookings/page.tsx` — Booking Management

**Required changes:**

```tsx
// Page header
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <h1 className="text-2xl md:text-3xl font-bold">Booking Management</h1>
</div>

// Tab list — allow horizontal scroll on mobile
<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
  <TabsList className="inline-flex w-max sm:w-full">
    <TabsTrigger className="text-xs sm:text-sm px-2 sm:px-4">All</TabsTrigger>
    {/* other tabs */}
  </TabsList>
</div>

// Booking cards grid
<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">

// Booking detail dialog — full-screen on mobile
<DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">

// Inside dialog: info grid
<div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
  {/* booking info fields */}
</div>

// Dialog footer buttons — stack on mobile
<DialogFooter className="flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">Confirm</Button>
  <Button className="w-full sm:w-auto">Decline</Button>
</DialogFooter>
```

---

### 10. `app/dashboard/chat/page.tsx` — Customer Chat

**This is the most complex page. The chat interface is split-panel.**

**Required changes:**

```tsx
// Outer card — full height minus header
<Card className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col overflow-hidden">

// Split panel — MOBILE: full-width list OR full-width messages (toggle)
// Add a state: const [showMessages, setShowMessages] = useState(false)

// Conversation list panel
<div className={cn(
  "flex flex-col border-r",
  "w-full md:w-72 lg:w-80",           // full width on mobile, sidebar on md+
  showMessages ? "hidden md:flex" : "flex"  // hide when message view active on mobile
)}>

// Message panel
<div className={cn(
  "flex flex-col flex-1",
  showMessages ? "flex" : "hidden md:flex"  // show only when selected on mobile
)}>
  {/* Back button — only on mobile */}
  <div className="flex items-center gap-2 p-3 border-b md:hidden">
    <Button variant="ghost" size="icon" onClick={() => setShowMessages(false)}>
      <ChevronLeft className="h-5 w-5" />
    </Button>
    <span className="font-medium text-sm truncate">{selectedUserName}</span>
  </div>
  {/* messages scroll area */}
</div>

// When user selects a conversation on mobile:
// onClick={() => { setSelectedUserId(conv.userId); setShowMessages(true); }}

// Message input area — prevent keyboard from covering input on mobile
<div className="border-t p-3 flex gap-2 items-end">
  <Input className="flex-1 min-w-0" placeholder="Type a message..." />
  <Button size="icon" className="flex-shrink-0 h-10 w-10">
    <Send className="h-4 w-4" />
  </Button>
</div>
```

---

### 11. `app/dashboard/payments/page.tsx` — Payment Verification

**Required changes:**

```tsx
// Stats cards
<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
  {/* each card: text-xs md:text-sm for labels, text-lg md:text-2xl for values */}
</div>

// Tab list — scrollable on mobile
<div className="overflow-x-auto">
  <TabsList className="inline-flex">
    <TabsTrigger className="text-xs sm:text-sm whitespace-nowrap px-3">Pending</TabsTrigger>
    {/* other tabs */}
  </TabsList>
</div>

// Payment proof cards — stack vertically on mobile
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

// Inside each card: info rows
<div className="flex items-start gap-2 text-sm">
  <span className="flex-shrink-0 text-gray-500 w-20">Booking:</span>
  <span className="min-w-0 break-words">{proof.bookingId}</span>
</div>

// Card actions — stack on small screens
<div className="flex flex-col sm:flex-row gap-2 mt-4">
  <Button className="flex-1 text-xs sm:text-sm">View Image</Button>
  <Button className="flex-1 text-xs sm:text-sm">Verify</Button>
  <Button className="flex-1 text-xs sm:text-sm">Reject</Button>
</div>

// Image preview dialog — responsive
<DialogContent className="w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
  <img className="w-full h-auto max-h-[60vh] object-contain rounded" />
</DialogContent>
```

---

### 12. `app/dashboard/reports/page.tsx` — Business Reports

**Required changes:**

```tsx
// Export controls — stack on mobile
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
    <Label className="text-sm whitespace-nowrap">Export Range:</Label>
    <Select>
      <SelectTrigger className="w-full sm:w-[140px]" />
    </Select>
  </div>
  <Button className="w-full sm:w-auto">Refresh</Button>
  <Button className="w-full sm:w-auto">Download PDF</Button>
</div>

// Summary stats grid
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Tab list — wrap/scroll on mobile
<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
  <TabsList className="inline-flex w-max">
    <TabsTrigger className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Monthly Summary</TabsTrigger>
    <TabsTrigger className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Booking Report</TabsTrigger>
    <TabsTrigger className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Sales Report</TabsTrigger>
    <TabsTrigger className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Customer Report</TabsTrigger>
  </TabsList>
</div>

// ALL charts — use responsive container with responsive height
<div className="w-full h-[220px] sm:h-[280px] md:h-[340px]">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={...} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
      <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
      <YAxis tick={{ fontSize: 10 }} width={45} />
      {/* etc */}
    </BarChart>
  </ResponsiveContainer>
</div>

// Pie chart — center and limit size
<div className="flex justify-center w-full h-[200px] sm:h-[250px]">
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie dataKey="value" cx="50%" cy="50%" outerRadius="70%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} />
    </PieChart>
  </ResponsiveContainer>
</div>

// Data tables inside reports — wrap for scroll
<div className="overflow-x-auto rounded-lg border">
  <table className="w-full min-w-[500px] text-sm">
    <thead>
      <tr>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Month</th>
        {/* other columns */}
      </tr>
    </thead>
  </table>
</div>
```

---

### 13. `app/dashboard/staff/page.tsx` — Staff Management

**Required changes:**

```tsx
// Search + Add button row
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  <Input placeholder="Search staff..." className="flex-1" />
  <Button className="w-full sm:w-auto gap-2">
    <Plus className="h-4 w-4" />Add Staff
  </Button>
</div>

// Summary stats
<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">

// Staff cards grid — stack on mobile
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

// Inside each staff card: info pairs
<div className="flex items-center gap-2 text-sm min-w-0">
  <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
  <span className="truncate">{staff.email}</span>
</div>

// Staff card action buttons
<div className="flex gap-2 mt-3">
  <Button variant="outline" size="sm" className="flex-1">
    <Edit2 className="h-4 w-4 mr-1" />Edit
  </Button>
  <Button variant="outline" size="sm" className="flex-1 text-red-600">
    <Trash2 className="h-4 w-4 mr-1" />Remove
  </Button>
</div>

// Add/Edit Staff dialog — full-screen on mobile
<DialogContent className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
  {/* Inside: name fields grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="grid gap-2"><Label>First Name</Label><Input /></div>
    <div className="grid gap-2"><Label>Last Name</Label><Input /></div>
  </div>
  {/* Salary + Hire Date */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="grid gap-2"><Label>Hire Date</Label><Input type="date" /></div>
    <div className="grid gap-2"><Label>Salary</Label><Input type="number" /></div>
  </div>
  <DialogFooter className="flex-col sm:flex-row gap-2">
    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
    <Button className="w-full sm:w-auto">Save</Button>
  </DialogFooter>
</DialogContent>
```

---

### 14. `app/calendar/page.tsx` — Booking Calendar

**Required changes:**

```tsx
// Page layout — stack vertically on mobile, side-by-side on lg
<div className="grid gap-6 grid-cols-1 lg:grid-cols-[auto_1fr]">
  
  {/* Left: calendar + controls */}
  <div className="flex flex-col gap-4">
    {/* Action buttons — stack on mobile */}
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button className="w-full sm:w-auto text-sm" onClick={() => setUnavailableDatesOpen(true)}>
        <CalendarX className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="truncate">Manage Unavailable Dates</span>
      </Button>
      <Button className="w-full sm:w-auto text-sm" onClick={() => setUnavailableOfficesOpen(true)}>
        <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="truncate">Manage Unavailable Offices</span>
      </Button>
    </div>
    
    {/* Calendar component — center on mobile */}
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border p-3 w-full max-w-sm mx-auto lg:mx-0"
      />
    </div>
  </div>

  {/* Right: booking list for selected day */}
  <div className="flex flex-col gap-4">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">
          {date ? date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Booking cards — each stacks info vertically on mobile */}
        {bookingsForSelectedDate.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-3 md:p-4 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <h3 className="font-medium text-sm md:text-base">{booking.eventName}</h3>
              <Badge className="self-start sm:self-auto">{booking.status}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />{booking.startTime} – {booking.endTime}
              </p>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3 flex-shrink-0" />{booking.guestCount} guests
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
</div>
```

---

### 15. `app/users/page.tsx` — Users Information

**Required changes:**

```tsx
// Search bar
<Input placeholder="Search users..." className="w-full max-w-sm" />

// Users table — wrap for horizontal scroll
<div className="overflow-x-auto rounded-lg border">
  <table className="w-full min-w-[600px]">
    <thead>
      <tr className="border-b bg-gray-50">
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      <tr>
        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{user.name}</td>
        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{user.email}</td>
        {/* etc */}
      </tr>
    </tbody>
  </table>
</div>
```

---

### 16. `components/reserve-dialog.tsx` — Booking Modal

**Required changes:**

```tsx
// Dialog wrapper
<DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
  <DialogHeader>
    <DialogTitle className="text-lg md:text-xl">Reserve a Space</DialogTitle>
    <DialogDescription className="text-xs md:text-sm">
      Fill in the details to book your event
    </DialogDescription>
  </DialogHeader>

// Tab list — scrollable on mobile
<div className="overflow-x-auto">
  <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-3">
    <TabsTrigger className="text-xs sm:text-sm whitespace-nowrap">Details</TabsTrigger>
    <TabsTrigger className="text-xs sm:text-sm whitespace-nowrap">Date & Time</TabsTrigger>
    <TabsTrigger className="text-xs sm:text-sm whitespace-nowrap">Confirm</TabsTrigger>
  </TabsList>
</div>

// Form fields — full width on mobile
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
  <div className="sm:col-span-2 grid gap-2">
    <Label className="text-sm">Event Name</Label>
    <Input className="h-10" placeholder="e.g. Birthday Party" />
  </div>
  <div className="grid gap-2">
    <Label className="text-sm">Space</Label>
    <Select><SelectTrigger className="w-full" /></Select>
  </div>
  <div className="grid gap-2">
    <Label className="text-sm">Guest Count</Label>
    <Input type="number" className="h-10" />
  </div>
</div>

// Calendar — center on mobile
<div className="flex justify-center overflow-x-auto">
  <Calendar mode="single" className="rounded-lg border mx-auto" />
</div>

// Time selects — side by side
<div className="grid gap-4 grid-cols-2">
  <div className="grid gap-2">
    <Label className="text-sm">Start Time</Label>
    <Select><SelectTrigger /></Select>
  </div>
  <div className="grid gap-2">
    <Label className="text-sm">End Time</Label>
    <Select><SelectTrigger /></Select>
  </div>
</div>

// Special requests — full width
<div className="grid gap-2">
  <Label className="text-sm">Special Requests</Label>
  <Textarea className="min-h-[80px] md:min-h-[100px] resize-none" />
</div>

// Footer
<DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
  <Button className="w-full sm:w-auto">Submit Booking</Button>
</DialogFooter>
```

---

### 17. `components/available-spaces-section.tsx` — Venue/Room Cards

**Required changes:**

```tsx
// Section heading + filter row
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Available Spaces</h2>
  {/* filter buttons if any */}
</div>

// Cards grid
<div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Each space card
<Card className="overflow-hidden flex flex-col">
  {/* Image */}
  <div className="relative aspect-video w-full">
    <img className="w-full h-full object-cover" />
  </div>
  <CardHeader className="pb-2">
    <CardTitle className="text-base md:text-lg">{space.name}</CardTitle>
    <CardDescription className="text-xs md:text-sm line-clamp-2">{space.description}</CardDescription>
  </CardHeader>
  <CardContent className="flex-1">
    {/* Capacity, price, etc */}
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <Users className="h-4 w-4 flex-shrink-0" />
      <span>Up to {space.capacity} guests</span>
    </div>
  </CardContent>
  <div className="p-4 pt-0">
    <ReserveButton className="w-full">Reserve This Space</ReserveButton>
  </div>
</Card>
```

---

### 18. `components/featured-reviews-section.tsx` — Review Cards

**Required changes:**

```tsx
// Reviews grid
<div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Review card — no fixed heights
<Card className="flex flex-col">
  <CardHeader className="pb-2">
    {/* Star rating — flex-wrap for small screens */}
    <div className="flex items-center gap-0.5 flex-wrap mb-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
    <CardTitle className="text-sm md:text-base">{review.reviewer}</CardTitle>
  </CardHeader>
  <CardContent className="flex-1">
    <p className="text-sm text-gray-600 line-clamp-4">{review.comment}</p>
  </CardContent>
</Card>
```

---

### 19. `components/transactions-dialog.tsx` — Booking History Dialog

**Required changes:**

```tsx
<DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">

// Transactions list — card-based instead of table on mobile
{transactions.map((tx) => (
  <div key={tx.id} className="border rounded-lg p-3 md:p-4 mb-3">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div className="min-w-0">
        <p className="font-medium text-sm md:text-base truncate">{tx.eventName}</p>
        <p className="text-xs text-gray-500">{tx.date}</p>
      </div>
      <Badge className="self-start sm:self-auto whitespace-nowrap">{tx.status}</Badge>
    </div>
    <div className="flex items-center justify-between mt-2">
      <p className="text-sm text-gray-600">{tx.venue}</p>
      <p className="text-sm font-medium">₱{tx.amount.toLocaleString()}</p>
    </div>
  </div>
))}
```

---

### 20. `components/cms-homepage-editor.tsx`, `cms-venue-editor.tsx`, `cms-office-room-editor.tsx` — CMS Editors

**Required changes for all CMS editors:**

```tsx
// Editor dialog
<DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">

// Field grid — always full-width on mobile
<div className="grid gap-4 grid-cols-1">
  {/* Exception: some 2-col pairs on sm+ */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="grid gap-2"><Label>Field A</Label><Input /></div>
    <div className="grid gap-2"><Label>Field B</Label><Input /></div>
  </div>
</div>

// Image upload area
<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
  <Button variant="outline" className="w-full sm:w-auto">
    Upload Image
  </Button>
  <p className="text-xs text-gray-500">Max 5MB, JPG/PNG/WEBP</p>
</div>

// Save/Cancel buttons
<div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
  <Button className="w-full sm:w-auto">Save Changes</Button>
</div>
```

---

### 21. `components/chat-widget.tsx` & `components/unified-chat-widget.tsx` — Customer Chat Widget

**Required changes:**

```tsx
// Widget container — position bottom-right, slightly smaller on mobile
<div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">

// Chat panel — nearly full screen on mobile
{isOpen && (
  <div className="
    w-[calc(100vw-2rem)] max-w-sm   /* full width minus margin on mobile */
    sm:w-96                           /* fixed width on sm+ */
    h-[60vh] sm:h-[500px]            /* taller on mobile relative, fixed on sm+ */
    flex flex-col
    rounded-xl shadow-2xl border bg-white overflow-hidden
  ">
    {/* Header */}
    <div className="flex items-center justify-between p-3 md:p-4 border-b bg-white">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="h-4 w-4 text-amber-700" />
        </div>
        <div>
          <p className="text-sm font-semibold">Support Chat</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
        <X className="h-4 w-4" />
      </Button>
    </div>

    {/* Messages */}
    <ScrollArea className="flex-1 p-3">
      {/* message bubbles — use max-w-[80%] for bubbles */}
      <div className="flex gap-2 mb-3">
        <div className="max-w-[80%] rounded-2xl px-3 py-2 bg-gray-100 text-sm">
          {message.text}
        </div>
      </div>
    </ScrollArea>

    {/* Input */}
    <div className="border-t p-3 flex gap-2">
      <Input className="flex-1 min-w-0 h-9 text-sm" placeholder="Type a message..." />
      <Button size="icon" className="h-9 w-9 flex-shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
)}

// Toggle button
<Button size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-amber-700 hover:bg-amber-800">
  <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
</Button>
```

---

### 22. `components/virtual-tour.tsx` — Panoramic Tour Viewer

**Required changes:**

```tsx
// Tour dialog
<DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden">

// Panoramic viewer — responsive aspect ratio
<div className="relative w-full aspect-video bg-black">
  {/* iframe or canvas for panoramic */}
  <iframe
    className="absolute inset-0 w-full h-full"
    src={tourUrl}
    allowFullScreen
  />
</div>

// Navigation controls — centered, touch-friendly
<div className="flex items-center justify-center gap-2 p-3 bg-black/80">
  <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20">
    <ChevronLeft className="h-5 w-5" />
  </Button>
  <span className="text-white text-sm px-4">Room {current} of {total}</span>
  <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20">
    <ChevronRight className="h-5 w-5" />
  </Button>
</div>
```

---

### 23. `components/admin-settings-dialog.tsx` & `components/settings-dialog.tsx` — Settings Dialogs

**Required changes:**

```tsx
<DialogContent className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">

// Settings tabs
<TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">

// Form fields
<div className="grid gap-4 grid-cols-1">
  <div className="grid gap-2">
    <Label className="text-sm">Setting Name</Label>
    <Input className="h-10" />
  </div>
</div>

// Action buttons
<DialogFooter className="flex-col sm:flex-row gap-2">
  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
  <Button className="w-full sm:w-auto">Save</Button>
</DialogFooter>
```

---

### 24. `components/payment-proof-upload.tsx` — Payment Upload Dialog

**Required changes:**

```tsx
<DialogContent className="w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">

// Upload drop zone — full width, touch-friendly height
<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center cursor-pointer hover:border-amber-500 transition-colors min-h-[120px] flex flex-col items-center justify-center">
  <Upload className="h-8 w-8 md:h-10 md:w-10 text-gray-400 mb-2" />
  <p className="text-sm font-medium">Click or drag to upload</p>
  <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (max 5MB)</p>
</div>

// Preview image — responsive
{previewUrl && (
  <img src={previewUrl} className="w-full h-auto max-h-[200px] object-contain rounded border" />
)}

// Buttons
<DialogFooter className="flex-col sm:flex-row gap-2">
  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
  <Button className="w-full sm:w-auto">Upload Proof</Button>
</DialogFooter>
```

---

## Typography Scale Reference

Apply this scale consistently across all pages:

| Element | Mobile | Tablet (`md:`) | Desktop (`lg:`) |
|---------|--------|----------------|-----------------|
| Page title (H1) | `text-2xl` | `text-3xl` | `text-4xl` |
| Section title (H2) | `text-xl` | `text-2xl` | `text-3xl` |
| Card title (H3) | `text-base` | `text-lg` | `text-xl` |
| Body text | `text-sm` | `text-base` | `text-base` |
| Caption / label | `text-xs` | `text-xs` / `text-sm` | `text-sm` |
| Badge / pill text | `text-xs` | `text-xs` | `text-xs` |

---

## Spacing Scale Reference

| Context | Mobile | `md:` | `lg:` |
|---------|--------|-------|-------|
| Page top/bottom padding | `py-8` | `py-12` | `py-16` |
| Section gap | `gap-4` | `gap-6` | `gap-8` |
| Card inner padding | `p-4` | `p-4` | `p-6` |
| Container side padding | `px-4` | `px-6` | — (container handles) |
| Dialog inner padding | `p-4` | `p-6` | — |

---

## Testing Checklist

After making all changes, verify each screen at:
- **320 px** (iPhone SE) — nothing overflows, all text readable, all buttons reachable
- **375 px** (iPhone 14) — standard mobile baseline
- **768 px** (iPad portrait) — tablet layout kicks in
- **1024 px** (iPad landscape / small laptop) — sidebar appears, grid columns expand
- **1280 px+** (desktop) — full layout

### Per-page checklist:
- [ ] No horizontal scroll on the page itself (only inside intentional overflow wrappers)
- [ ] All button rows collapse to column on mobile and expand on `sm:`
- [ ] All grids use responsive columns
- [ ] All dialogs are `max-w-[95vw]` with `overflow-y-auto`
- [ ] All charts use `ResponsiveContainer width="100%" height="100%"` inside a responsive `div`
- [ ] All tables are wrapped in `overflow-x-auto`
- [ ] Chat panels on mobile show only one panel at a time (list OR messages)
- [ ] Touch targets are at least 40×40 px
- [ ] Text does not overflow its container (use `truncate`, `break-words`, or `min-w-0` as needed)
- [ ] Fixed/floating elements don't cover important content on mobile

---

## Implementation Notes for the AI

1. **Do not break existing logic.** Only change className strings and wrapping `<div>` elements. Do not remove or reorganize state, hooks, API calls, or event handlers.
2. **Preserve existing responsive classes** that are already correct — the homepage and main-layout already have a solid foundation; don't regress them.
3. **Use Tailwind only** — no inline styles for responsiveness, no CSS modules.
4. **shadcn/ui components** accept `className` props — always spread them: `<Button className={cn("w-full sm:w-auto", className)}>`.
5. **Import `cn`** from `@/lib/utils` when combining conditional classes.
6. **Charts (Recharts):** Always set `margin={{ top: 5, right: 10, left: 0, bottom: 5 }}` on chart components to prevent label clipping.
7. **Calendar component** from shadcn/ui is fixed-width by default — center it with `flex justify-center` and let it take its natural width; do not force `w-full` on it.
8. **Do not change API routes** (`app/api/**`) — these are server-side and unaffected by UI responsiveness.
9. **Commit order suggestion:** Start with the two layout files (`public-layout.tsx`, `main-layout.tsx`), then do public pages, then dashboard pages, then components.
