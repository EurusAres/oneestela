# =============================================================================
# ONE ESTELA PLACE — RESPONSIVE UI OVERHAUL PROMPT
# For use with: Claude Code, Cursor, GitHub Copilot Workspace, or any AI coding agent
# =============================================================================

## ROLE
You are a senior frontend engineer specializing in responsive web design. Your
task is to audit and refactor the entire UI of the One Estela Place Next.js
application to be fully responsive across all screen sizes: mobile (320px–767px),
tablet (768px–1023px), and desktop (1024px+).

## REPOSITORY CONTEXT
- Framework: Next.js 14 with App Router
- Language: TypeScript
- Styling: Tailwind CSS v3 + shadcn/ui (Radix UI primitives)
- Key directories:
    /app            → All pages and route segments (public + admin dashboard)
    /components     → Shared UI components
    /styles         → Global CSS
- User types: public visitors (clients) and authenticated admins
- Admin dashboard lives at /app/dashboard (sidebar navigation, data tables,
  CMS editors, booking management, payment review, staff management)
- Public pages: homepage, booking flow, 360 virtual tour, venue listings, reviews

## BREAKPOINT CONVENTIONS (use these Tailwind prefixes consistently)
- Mobile-first base styles  → no prefix (applies from 0px up)
- Tablet                    → md: (768px+)
- Desktop                   → lg: (1024px+)
- Wide desktop              → xl: (1280px+)

## WHAT TO DO — STEP BY STEP

### STEP 1 — AUDIT
Before writing any code, scan all files under /app and /components. For each
file, identify:
  - Fixed pixel widths (e.g. w-[800px], width: 900px)
  - Hardcoded heights that break on small screens
  - Flex or grid rows that do not wrap on mobile
  - Tables that overflow horizontally without a scroll wrapper
  - Font sizes that are too large or too small on mobile
  - Modals, dialogs, and drawers that are not full-screen on mobile
  - Navigation that does not collapse into a mobile menu
  - Images without proper responsive sizing
Output a brief file-by-file list of issues found before making any changes.

### STEP 2 — NAVIGATION & LAYOUT SHELLS

#### Public navigation (header/navbar)
- On mobile: collapse all nav links into a hamburger menu (use shadcn Sheet or
  Drawer component). The logo and a single CTA button (e.g. "Book now") remain
  visible on the top bar.
- On tablet+: show full horizontal navigation links.
- Ensure the sticky/fixed header does not overlap page content (add correct
  padding-top to the page body).

#### Admin dashboard sidebar
- On mobile (< 768px): sidebar must be hidden by default and toggled via a
  hamburger/menu button in the top bar. Use shadcn Sheet for the mobile drawer.
- On tablet (768px–1023px): sidebar can be in a collapsed icon-only mode.
- On desktop (1024px+): full expanded sidebar, always visible.
- Wrap the main content area with: flex-1 min-w-0 overflow-auto so it never
  pushes past the viewport.

### STEP 3 — PUBLIC PAGES

#### Homepage (/app/page.tsx)
- Hero section: text and CTA stack vertically on mobile, side-by-side on lg+.
  Hero images use next/image with fill or responsive sizing. No fixed heights.
- Feature cards: 1 column on mobile, 2 on md, 3 on lg.
- About section: full-width stacked on mobile, 2-column grid on lg.
- CTA section: centered, full-width button on mobile.

#### Venue listing page
- Cards: 1 column on mobile, 2 on md, 3 on lg.
- Each card: image on top, content below. No fixed card heights.
- Filter/search bar: full-width on mobile, inline on md+.

#### Venue detail / booking flow
- Gallery images: single image with thumbnail strip on mobile; grid on lg.
- Booking form: full-width stacked fields on mobile. Use a sticky bottom bar
  on mobile for the "Book now" CTA instead of a sidebar.
- Date/time pickers: full-width on mobile, use react-day-picker's responsive
  mode.

#### 360° Virtual Tour page
- Iframe or viewer: 100vw on mobile, constrained max-width on desktop.
- Room selector: horizontal scrollable pill list on mobile, vertical sidebar on lg.

#### Reviews page
- Review cards: single column on mobile, 2 columns on lg.
- Star rating input: large tap targets (min 44×44px) on mobile.

### STEP 4 — ADMIN DASHBOARD PAGES (/app/dashboard/*)

#### Dashboard home / analytics
- Stats cards (KPI tiles): 1 column on mobile, 2 on md, 4 on lg.
- Recharts graphs: use ResponsiveContainer with width="100%" on all charts.
  Add a horizontal scroll wrapper on mobile if needed.

#### Bookings management table
- Wrap every DataTable in: <div className="w-full overflow-x-auto">
- On mobile, consider a card-list view instead of a table. Each booking becomes
  a card showing: guest name, room, date, status, and an action button.
- Use shadcn's DropdownMenu for row actions (Edit, Cancel, Confirm) instead of
  inline buttons that overflow on small screens.

#### Payment proofs review
- Proof image: full-width lightbox/dialog on mobile.
- Status badge and action buttons: stacked vertically on mobile.

#### CMS editors (homepage, venues, office rooms)
- Two-panel editors (preview + form): stack vertically on mobile (form on top,
  preview below), side-by-side on lg.
- Rich text or image URL inputs: full-width on all sizes.

#### Staff management
- Staff cards: 1 column mobile, 2 md, 3 lg.
- Staff form (add/edit): full-width modal/drawer, fields stacked vertically.

#### Admin change password / settings
- Form: max-width 480px, centered, full-width on mobile.

### STEP 5 — SHARED COMPONENTS

#### Modals and Dialogs (shadcn Dialog)
- On mobile (< 640px), dialogs should render as full-screen sheets:
  Use DialogContent with className="sm:max-w-lg w-full h-full sm:h-auto
  rounded-none sm:rounded-lg" or switch to the Sheet component.

#### Forms
- All form fields: full-width (w-full) by default.
- Label always above the input, never inline on mobile.
- Submit buttons: full-width on mobile (w-full), auto-width on md+.

#### Tables (all instances)
- Always wrap in <div className="w-full overflow-x-auto rounded-lg border">.
- Column priority on small screens: hide non-essential columns using
  Tailwind hidden md:table-cell on lower-priority <th> and <td> elements.

#### Images (all next/image usage)
- Replace any fixed width/height pairs with layout="responsive" or use the
  fill prop inside a sized container.
- Add sizes prop: sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

#### Buttons and tap targets
- All interactive elements: minimum 44×44px touch target on mobile.
- Icon-only buttons must include a visible label or aria-label.

### STEP 6 — TYPOGRAPHY & SPACING

- Headings: use fluid/responsive sizes. Example:
    h1: text-2xl md:text-4xl lg:text-5xl
    h2: text-xl md:text-3xl
    h3: text-lg md:text-2xl
- Body text: text-sm md:text-base
- Section padding: py-8 md:py-16 px-4 md:px-8 lg:px-16
- Avoid hardcoded padding/margin in pixels; use Tailwind spacing scale.

### STEP 7 — TESTING CHECKLIST
After all changes, verify each of the following at 320px, 375px, 768px, 1024px,
and 1440px viewport widths:
  [ ] No horizontal scrollbar on any public page
  [ ] No horizontal scrollbar on any admin page
  [ ] Navigation collapses correctly on mobile
  [ ] Admin sidebar opens/closes correctly on mobile
  [ ] All tables are horizontally scrollable or convert to card view
  [ ] All modals/dialogs are usable on mobile
  [ ] All forms are fully usable on mobile (no clipping, no overflow)
  [ ] All images load and display correctly at all sizes
  [ ] All buttons have adequate tap target size
  [ ] Booking flow is completable end-to-end on mobile
  [ ] Charts render responsively and do not overflow
  [ ] CMS editors are usable on mobile

## CONSTRAINTS & RULES
- Do NOT change any business logic, API routes, or database queries.
- Do NOT change color schemes, branding, or design tokens — only layout.
- Do NOT remove or replace shadcn/ui components — use their built-in responsive
  props and compose them correctly.
- Do NOT introduce new third-party packages. Use only what is already in
  package.json (shadcn, Radix, Tailwind, lucide-react, etc.).
- Maintain full TypeScript type safety. Do not add @ts-ignore or any.
- Keep all existing functionality: booking, payment upload, CMS editing,
  staff management, reviews, virtual tour, email verification.
- Commit changes in logical groups: one commit per section/feature area.

## PRIORITY ORDER (work in this order if doing incrementally)
1. Navigation & layout shells (highest impact, affects every page)
2. Admin dashboard sidebar + main content wrapper
3. Admin data tables (bookings, payments, staff)
4. Public homepage
5. Venue listing + detail + booking flow
6. Admin CMS editors
7. Modals, dialogs, and forms (global pass)
8. Images and typography (global pass)
9. 360 virtual tour page
10. Reviews page

## OUTPUT FORMAT
For each file you modify:
1. State which file you are editing and why.
2. Show the before (relevant excerpt) and after (full updated section).
3. Briefly note what responsive behavior was added.

Begin with Step 1 (audit). Do not write any code until the audit is complete
and you have listed the issues per file.