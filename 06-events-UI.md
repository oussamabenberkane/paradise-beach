# Agent 06 — Events UI

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

Agents 01–03 are complete. Design system, data, navigation, utilities are in place.

**Your job:** Build the Events module — the event list page and individual event detail page.

---

## Design System

```ts
const T = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  surface3: "var(--surface-3)",
  border: "var(--border)",
  borderStrong: "var(--border-strong)",
  text: "var(--text)",
  text2: "var(--text-2)",
  text3: "var(--text-3)",
  text4: "var(--text-4)",
  accent: "var(--accent)",
  accentTint: "var(--accent-tint)",
  accentTint2: "var(--accent-tint-2)",
  success: "var(--success)",
  successTint: "var(--success-tint)",
  warn: "var(--warn)",
  warnTint: "var(--warn-tint)",
  danger: "var(--danger)",
  dangerTint: "var(--danger-tint)",
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
};
```

---

## File 1: `src/app/events/page.tsx`

Server component, wrapped in `<AppShell>`.

### Page Header

Title: "Events" (h1), subtitle: "X events this season", `Calendar` icon from Lucide.

### Filter Bar — `EventFilterBar` (client component)

Filter chips:
- **By time**: "All", "This Week", "This Month", "Upcoming"
- **By venue**: "All Venues", then dynamically list unique `venueSection` values from data

The filter bar is a client component. Pass the full sorted events array as prop. Filter and display the grid client-side.

Default sort: chronological (earliest first).

### Event Card Grid

2-column grid on desktop (each card is wide), 1-column on mobile.

Each event card:
- **Cover image area**: 180px tall `<div>`, gradient background (unique warm sunset gradient per event — derive from event.id). Show event title and date overlaid on the gradient with a dark scrim at bottom. `Calendar` icon + formatted date as a pill in top-left corner.
- **Card body** (below image):
  - Event title: bold, 16px, `T.text`
  - Venue section: `T.text4` with `MapPin` icon (Lucide)
  - Time: `startTime → endTime` with `Clock` icon
  - Headliner: singer name with `Mic2` icon — look up headlinerId in singers data
  - **Capacity bar**: thin progress bar (6px tall, border-radius 99px), accent fill, gray background. "X% full" label beside it.
  - "View Details →" link, accent color

Card hover: `y: -4, box-shadow: T.tier2`, 0.2s ease transition.

Cards animate in with stagger: `y: 20 → 0, opacity: 0 → 1`.

### Sold-Out Badge

If an event is fully sold out (all tiers sold >= total), show a "SOLD OUT" badge overlaid on the image (top-right, danger background, white text, bold, 11px).

---

## File 2: `src/app/events/[id]/page.tsx`

Server component. `params: { id: string }`. If event not found: `notFound()`.

### Layout

Wrap in `<AppShell>`. Back link: "← Events" → `/events`.

### Hero Banner

Full-width hero (max-height 320px, overflow hidden):
- Background: warm sunset gradient unique to this event (same derivation as list page for consistency — use event.id to pick gradient)
- Overlay: dark gradient scrim at bottom
- Text overlaid: event title (very large, white, bold), date + time below it
- Venue section badge (white pill)

### Event Details Section (two-column on desktop, stacked on mobile)

**Left column — Lineup:**

"Tonight's Lineup" section title with `Mic2` icon.

Headliner card:
- "HEADLINER" label badge (accent)
- Singer photo placeholder (gradient circle, 64px)
- Singer name, genre pills
- Bio snippet (first sentence)
- Link to `/singers/[id]`

Support acts (if any):
- "SUPPORT" label badge (text3)
- Compact row per support act: photo circle (40px), name, genre

**Right column — Event Info + Tickets:**

Event info card:
- Date (formatted nicely: "Sunday, 14 June 2026"), Calendar icon
- Doors open / start time / end time
- Venue section
- Total capacity: "X seats total"
- Description: full paragraph, `T.text2`
- Tags: pills for each tag

Ticket Tiers card (separate card below info):

Title: "Ticket Availability" with `Ticket` icon.

For each tier:
- Tier name badge (VIP = gold/warn background, General = surface3, Backstage = accent)
- Price: large, bold, `T.text`
- Availability bar: `(sold/total)%` fill, color-coded:
  - < 50% sold: success color
  - 50–85% sold: warn color
  - > 85% sold: danger color
- "X of X sold" in small text
- "X available" in `T.text3`
- If sold out: "SOLD OUT" badge, bar is full danger red

If all tiers sold out: a "Join Waitlist" button (visual only — no actual functionality, just styled).

"Total Revenue" chip at bottom: sum of (sold × price) for all tiers, formatted as currency.

---

## Data Loading

```ts
import eventsData from "@/data/events.json";
import singersData from "@/data/singers.json";
import ticketsData from "@/data/tickets.json";
import type { Event, Singer, EventTickets } from "@/lib/types";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
```

Gradient derivation helper (use in both list and detail pages — put it in `src/lib/utils.ts` or inline):
```ts
const EVENT_GRADIENTS = [
  "linear-gradient(135deg, #E8580C 0%, #F5A623 100%)",
  "linear-gradient(135deg, #E53935 0%, #E8580C 100%)",
  "linear-gradient(135deg, #F5A623 0%, #2D9E5F 100%)",
  "linear-gradient(135deg, #1E88E5 0%, #2D9E5F 100%)",
  "linear-gradient(135deg, #7B1FA2 0%, #E8580C 100%)",
  "linear-gradient(135deg, #E8580C 0%, #E53935 100%)",
  // ... add ~6 more warm/beach gradients
];
// Use: EVENT_GRADIENTS[parseInt(event.id.replace("e","")) % EVENT_GRADIENTS.length]
```

---

## Constraints

- Server components for data loading; client components only for filter interactivity and card animations
- Ticket availability computed from `tickets.json` — match `eventId` field
- Do NOT add "Buy Tickets" functionality — this is a read-only dashboard
- Framer Motion: use `whileHover` on cards, `initial/animate` for page entrance

---

## After writing all files

`cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | grep -E "error TS|Error:" | head -20`
