# Agent 04 — Dashboard UI

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

Agents 01–03 have already run:
- Design system CSS vars in `src/app/globals.css`
- TypeScript types in `src/lib/types.ts` (Singer, Event, EventTickets, TicketTier)
- Utilities in `src/lib/utils.ts` (cn, formatDate, formatCurrency, formatTime)
- JSON data in `src/data/singers.json`, `src/data/events.json`, `src/data/tickets.json`
- Navigation: `AppShell`, `Sidebar`, `TopBar` in `src/components/nav/`

**Your job:** Build the dashboard page at `src/app/page.tsx`.

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

Cards use `tier1` shadow, border-radius 16px, background `T.surface`.

---

## File to Create

### `src/app/page.tsx`

This is a **server component** (no `"use client"`) — import JSON data directly and compute stats. Only sub-components that need interactivity should be client components.

#### Layout

Wrap everything in `<AppShell>` imported from `@/components/nav/AppShell`.

Page title: "Dashboard" (h1, large, `T.text`), subtitle: "Season overview" in `T.text3`.

#### Section 1: Stats Row (4 KPI cards)

Compute from data:
1. **Upcoming Events** — count events with date >= today (`new Date().toISOString().split("T")[0]`)
2. **Total Tickets Sold** — sum of all `sold` across all tiers across all events
3. **Season Capacity** — total sold / total capacity × 100, displayed as "X% filled"
4. **Total Revenue** — sum of (tier.sold × tier.price) for all tiers, formatted as currency

Each KPI card:
- White background, tier1 shadow, 16px radius
- Icon (Lucide) in an accent-tinted circle (32×32px, background `T.accentTint2`)
- Large number (28px, font-weight 800)
- Label below in `T.text3`, 13px

Lucide icons: `Calendar` for upcoming, `Ticket` for sold, `Users` for capacity, `TrendingUp` for revenue.

Animate cards in: stagger 0.08s delay per card, `y: 20 → 0, opacity: 0 → 1`.

#### Section 2: "Next Up" Event Card

Find the next upcoming event (earliest date >= today). Display as a wide hero card:
- Left: event cover image placeholder (gradient fill with event color if no image — use a warm sunset gradient `linear-gradient(135deg, #E8580C 0%, #F5A623 100%)`) with the event title overlaid
- Right: Event details
  - Date badge: pill with accent background, white text
  - Event title: large bold
  - Venue section
  - Time range (startTime → endTime)
  - Headliner name (look up singer by headlinerId)
  - Tickets left: compute from tickets data, show "X tickets remaining" — if < 50 show in `T.warn` or `T.danger`
  - CTA button: "View Event →" linking to `/events/[id]`, accent background, white text

Card: tier2 shadow, 20px radius, overflow hidden.

#### Section 3: Recent Events Strip (last 3 past/upcoming events)

Small horizontal strip of 3 compact cards:
- Event title (bold, truncated)
- Date in `T.text4`
- Headliner name
- Small capacity bar: sold/total as a thin progress bar, accent color
- Link to `/events/[id]`

#### Section 4: Quick Chat Widget

A teaser card that deep-links to `/chat`:
- Title: "Ask the Beach Assistant"
- Subtitle: "Explore events, artists, and ticket availability"
- A fake-looking input field (not interactive) with placeholder "Who is playing this weekend?"
- On click of the entire card (or a "Chat now" button), navigate to `/chat`
- Accent gradient background, white text, wave decoration

This is a client component (needs `useRouter` for navigation). Extract it as a small `QuickChatWidget` client component in the same file.

#### Section 5: Featured Singer

Pick the singer with the most upcoming events. Show a compact spotlight card:
- Photo placeholder (circle, 64px, gradient background)
- Name, genre pills
- "X upcoming events" count
- Link to `/singers/[id]`

---

## Data Loading Pattern

Since this is a server component, import JSON directly:

```ts
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import ticketsData from "@/data/tickets.json";
import type { Singer, Event, EventTickets } from "@/lib/types";

const singers = singersData as Singer[];
const events = eventsData as Event[];
const tickets = ticketsData as EventTickets[];
```

---

## Constraints

- Page is a server component. Only extract client components where needed (QuickChatWidget)
- All computations (stats, next event) happen server-side
- Use Framer Motion only in client sub-components (the server component itself can't use it)
- Images use Next.js `<Image>` with a fallback gradient for missing files — or just use `<div>` with gradient since images are placeholder paths
- Do NOT use `<img>` tags directly for event covers — use a styled `<div>` with gradient as placeholder

---

## After writing the file

Verify: `cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | grep -E "error TS|Error:" | head -20`
