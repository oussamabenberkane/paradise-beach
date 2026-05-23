# Agent: Paradise Beach — User App (SunsetStrip V2 Design)

## Context

You are working on **Paradise Beach**, a frontend-only Next.js app (no backend). All data lives in JSON files under `/src/data/`. The app uses:

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 + CSS variables (defined in `src/app/globals.css`)
- Framer Motion for animations
- Lucide React icons
- GSAP + Lenis (already installed)
- Fonts: Manrope (sans) + JetBrains Mono (mono)

### Current state

The app has several existing user-facing pages with a warm sand design (--bg: #FFF8F0). You will **redesign** these pages to use the **SunsetStrip V2** aesthetic — a cinematic dark-mode design with a day→night hero transition, dark navy/black dashboard, and glowing accents.

There is also a `/showcase` folder with design experiments. The SunsetStrip V2 design lives at `src/app/showcase/_directions/SunsetStripV2.tsx` with CSS at `src/app/showcase/_directions/sunsetstrip.css` and `src/app/showcase/_directions/sunsetstrip-v2.css`. **Read these files carefully** — they contain the complete visual logic you must adapt.

Do NOT touch:
- `/src/app/admin/` (admin area handled by a separate agent)
- `/src/app/showcase/` (design experiments, keep as-is)
- `/src/app/chat/` (chat interface, keep as-is)
- `/src/app/api/` (API routes, keep as-is)
- `/src/agent/`, `/src/lib/`, `/src/data/` — keep existing files, you may add new ones

---

## Design Language: SunsetStrip V2

### Core aesthetic
- **Dark palette**: near-black background (`#0A0A0C`), dark navy surfaces
- **Accent**: warm white text, golden/amber highlights, neon CTA glow
- **Hero**: full-viewport cinematic section with day→night photo crossfade on scroll (3-beat animation)
- **Typography**: large, editorial — uppercase tracking, italic emphasis, generous whitespace
- **Cards**: dark surface with photo top, metadata bottom, capacity fill bar

### Design tokens for the dark design (add to a scoped CSS file, not globals.css)

```css
/* used only within the SunsetStrip sections */
--ss-bg: #0A0A0C;
--ss-surface: #131316;
--ss-surface-2: #1C1C21;
--ss-border: rgba(255,255,255,0.08);
--ss-text: #F5F5F0;
--ss-text-2: #B8B4AA;
--ss-text-3: #7A7670;
--ss-accent-warm: #FFB627;     /* golden hour */
--ss-accent-glow: #E8580C;    /* sunset orange (matches --accent) */
--ss-nav-blur: blur(12px) saturate(1.4);
```

### Key CSS classes to use (from the existing showcase CSS)
Read `src/app/showcase/_directions/sunsetstrip.css` and `sunsetstrip-v2.css` to understand the full class system. Key classes:
- `.ssv2-hero`, `.ssv2-sticky`, `.ssv2-day`, `.ssv2-night` — hero cinematic section
- `.ssv2-overlay.ssv2-warm`, `.ssv2-cool`, `.ssv2-dark` — color overlays
- `.ssv2-content`, `.ssv2-eyebrow`, `.ssv2-title`, `.ssv2-cta` — hero copy
- `.ss-dashboard` — dark dashboard wrapper
- `.ss-sticky-nav` — sticky navigation bar
- `.ss-band`, `.ss-section`, `.ss-grid`, `.ss-card` — content sections
- `.ss-chat`, `.ss-chat-neon-frame`, `.ss-chat-neon-text` — chat section
- `.ss-marquee`, `.ss-marquee-track` — velocity-driven scrolling marquee
- `.ss-stat-block`, `.ss-stat-num`, `.ss-stat-lbl` — stats

Copy these CSS files verbatim into `src/app/(user)/` and import them where needed.

---

## Data Layer

Use the existing `getShowcaseData()` function from `src/app/showcase/_shared/data.ts` — it already enriches events with headliner, ticket stats, fill %, revenue, etc. You can import it directly.

Also use the existing JSON data:
```ts
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import ticketsData from "@/data/tickets.json";
```

For ticket registration, use a separate localStorage store:
```ts
// src/lib/registrations-store.ts
interface Registration {
  id: string;            // random UUID
  eventId: string;
  tierName: string;
  quantity: number;
  name: string;
  email: string;
  bookedAt: string;      // ISO string
  confirmationCode: string;  // e.g. "PB-A3F2"
}

function getRegistrations(): Registration[]
function addRegistration(data: Omit<Registration, "id" | "bookedAt" | "confirmationCode">): Registration
function getRegistrationsByEmail(email: string): Registration[]
```

Confirmation code format: `"PB-" + 4 random uppercase alphanumeric chars`.

For **live ticket availability**: When computing remaining tickets for a tier, subtract registered quantities from localStorage from the JSON `sold` count. This makes the UI feel live — if a user books 2 VIP tickets, the count updates.

```ts
function getAvailableCount(eventId: string, tierName: string, originalTotal: number, originalSold: number): number {
  const regs = getRegistrations().filter(r => r.eventId === eventId && r.tierName === tierName);
  const bookedLocally = regs.reduce((s, r) => s + r.quantity, 0);
  return originalTotal - originalSold - bookedLocally;
}
```

---

## Route Structure

Use a route group `(user)` to isolate the user-facing layout:

```
src/app/
  (user)/
    layout.tsx          ← user app layout (minimal, no sidebar — nav is inline)
    page.tsx            ← homepage (SunsetStrip V2 hero + dashboard)
    events/
      page.tsx          ← all events (dark grid)
      [id]/
        page.tsx        ← event detail + ticket registration
    singers/
      page.tsx          ← artists grid (dark style)
      [id]/
        page.tsx        ← singer profile (dark style)
    my-tickets/
      page.tsx          ← user's registered tickets
```

> **Important:** Delete or replace `src/app/page.tsx`, `src/app/events/`, `src/app/singers/`, `src/app/tickets/` with the new `(user)/` group versions. The old pages used the warm sand design — the new ones use SunsetStrip V2. The `/tickets` route is replaced by `/my-tickets` for the user (admin manages tickets at `/admin/tickets`).

---

## Page Specifications

### 1. Homepage — `(user)/page.tsx`

This is a **server component** (data fetched server-side, no "use client" needed for the outer shell).

**Structure:**
1. **Hero section** — lifted from `SunsetStripV2.tsx`. 300vh scroll height, cinematic day→night transition. Photos at `/beach-assets/day-time.webp` and `/beach-assets/night-time.webp` (these may not exist — use a gradient fallback: day = `linear-gradient(135deg, #FFB627, #E8580C)`, night = `linear-gradient(135deg, #0A0A0C, #1C2B4A)`).
2. **Sticky nav** — appears after hero. Links: "Events", "Artists", "Tickets" (→ /my-tickets), "Chat".
3. **Stats band** — 4 count-up blocks: Nights, Tickets Sold, % Filled, Revenue.
4. **"The Lineup" section** — Top 4 upcoming events in a 2×2 card grid (SunsetCard style).
5. **"ASK THE STRIP" section** — Chat call-to-action with neon sign aesthetic. 3 suggested prompts. Link to `/chat`.
6. **Velocity marquee** — "UNTIL LAST LIGHT ★ PARADISE BEACH ★ SUMMER '26" looping.
7. **Footer** — "paradise · summer 2026 · open until last light"

The hero scroll animation logic is a `useEffect` in the client sub-component — see `SunsetStripV2.tsx:88–149` for the exact implementation. Copy it verbatim (it uses CSS custom properties on the section element).

### 2. Events Page — `(user)/events/page.tsx`

Dark grid of all events. Server component.

**Layout:**
- Dark background (`--ss-bg`)
- Page title: "LINEUP" in large uppercase, with eyebrow "★ ALL EVENTS · SUMMER '26 ★"
- Filter chips: All / This Week / Next Month / By Genre (client-side filtering via URL search params)
- Event grid: same `SunsetCard` style as homepage grid
- "Sold out" badge on cards where `isSoldOut === true`
- Each card links to `/events/[id]`

**Filter logic:** Use `useSearchParams` + `useRouter` for filter state in a `"use client"` filter bar component. Server component fetches all events and passes to the filter bar.

### 3. Event Detail — `(user)/events/[id]/page.tsx`

Server component that loads event data, renders the dark detail view, and includes a client component for ticket registration.

**Layout:**
- **Hero**: Full-width cover image (or gradient fallback). Event title, date, venue overlaid on dark scrim.
- **Headliner section**: Headliner photo + name + genre tags. Support acts listed below.
- **Event info**: Date, time, venue section, description.
- **Ticket section**: `<TicketSelector>` client component (see below).

**`TicketSelector` client component:**

Props: `eventId`, `tiers` (array of `TicketTier`), `eventTitle`.

State: `selectedTier`, `quantity` (1–10), form fields (`name`, `email`), `step` ("select" | "form" | "confirm" | "success").

**Step "select":**
- Each tier shown as a card: name, price, available count (use `getAvailableCount()`), fill bar.
- Tiers with 0 available are greyed out with "SOLD OUT" badge.
- Clicking a tier card selects it.
- "Get Tickets" button → step "form".

**Step "form":**
- Selected tier + price shown at top.
- Quantity selector (1–10, capped at available).
- Name input (required), Email input (required, type="email").
- "Confirm Reservation" button → `addRegistration()` → step "success".
- "← Back" link → step "select".

**Step "success":**
- Confirmation code displayed prominently: `PB-XXXX`.
- Summary: event, tier, quantity, total price.
- "View My Tickets" link → `/my-tickets`.
- "← Back to Events" link.

Design: The ticket selector uses the dark SunsetStrip palette. Tier cards have `--ss-surface` background, `--ss-border` border, `--ss-accent-warm` for selected state. The "Confirm" button uses `--ss-accent-glow`.

### 4. Artists Page — `(user)/singers/page.tsx`

Dark artist grid. Server component.

**Layout:**
- Dark background
- Title: "THE ARTISTS"
- Search/filter: genre filter chips (client component)
- Artist cards: photo (or gradient avatar), name, genres, upcoming events count
- Each card links to `/singers/[id]`

### 5. Singer Detail — `(user)/singers/[id]/page.tsx`

**Layout:**
- Hero: large artist photo or gradient. Name overlaid.
- Bio section
- Genre pill tags
- "Upcoming at Paradise Beach": list of event cards linking to `/events/[id]`
- Social links (Instagram, Spotify) with icons

### 6. My Tickets — `(user)/my-tickets/page.tsx`

Client component (reads from localStorage).

**Layout:**
- Dark background, title "MY TICKETS"
- If no registrations: empty state ("No tickets yet → Browse Events")
- List of registration cards, each showing:
  - Event title + date
  - Tier name + quantity + total price
  - Confirmation code (`PB-XXXX`) in monospace/JetBrains Mono
  - A decorative "ticket stub" design (dashed left border, accent color)
- Sort: most recent first

---

## User Layout — `(user)/layout.tsx`

Minimal layout — no persistent sidebar. Navigation is inline within each page (the sticky nav in the homepage, a minimal top bar on other pages).

Create a `<UserTopBar>` component that appears on all pages except the homepage (which has its own sticky nav). It should:
- Be fixed to top, `backdrop-filter: blur(12px)`, dark semi-transparent background
- Left: "Paradise Beach" brand (small)
- Right: Nav links (Events, Artists, My Tickets, Chat) + "ASK THE STRIP" button

The layout wraps children with Lenis smooth scroll (already installed):
```tsx
"use client";
import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  return <>{children}</>;
}
```

---

## CSS Strategy

1. Copy `sunsetstrip.css` and `sunsetstrip-v2.css` from `src/app/showcase/_directions/` to `src/app/(user)/sunsetstrip.css` and `src/app/(user)/sunsetstrip-v2.css`.
2. Import them in the relevant page files.
3. Create additional CSS files as needed (`events.css`, `tickets.css`) for page-specific dark styles.
4. Do NOT add dark styles to `globals.css` — keep that file as-is (it powers the admin and chat pages).

---

## Implementation Order

1. `src/lib/registrations-store.ts` — ticket registration localStorage store
2. `src/app/(user)/layout.tsx` — user layout with Lenis + UserTopBar
3. Copy SunsetStrip CSS files to `(user)/`
4. `src/app/(user)/page.tsx` — homepage with full SunsetStrip V2 hero + dashboard
5. `src/app/(user)/events/page.tsx` — dark events grid
6. `src/app/(user)/events/[id]/page.tsx` — event detail + TicketSelector
7. `src/app/(user)/singers/page.tsx` — dark artists grid
8. `src/app/(user)/singers/[id]/page.tsx` — singer detail
9. `src/app/(user)/my-tickets/page.tsx` — registered tickets

After creating all `(user)/` pages, delete the now-redundant old pages:
- `src/app/page.tsx`
- `src/app/events/` (the whole directory)
- `src/app/singers/` (the whole directory)
- `src/app/tickets/` (the whole directory — replaced by /my-tickets)

---

## Key Constraints

- **No auth** — my-tickets is not protected, it reads from localStorage by design
- **No external component libraries** for ticket UI — build from scratch with CSS vars
- **Framer Motion** for card entrance animations (same pattern as `SunsetCard` in the showcase)
- **Image fallbacks** — all `<img>` tags must have a gradient `style={{ background: "..." }}` fallback in case images don't exist
- **Server components** where possible; only use `"use client"` for interactive parts (filters, TicketSelector, my-tickets, smooth scroll)
- **Do NOT import from `src/app/showcase/`** — copy what you need into `(user)/`
