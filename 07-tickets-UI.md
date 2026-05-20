# Agent 07 — Tickets UI

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

Agents 01–03 are complete. Design system, data, navigation, utilities are in place.

**Your job:** Build the Tickets overview page — a cross-event summary of all ticket sales.

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

## File to Create: `src/app/tickets/page.tsx`

Server component, wrapped in `<AppShell>`.

### Page Header

Title: "Tickets" (h1 with `Ticket` icon from Lucide).
Subtitle: "Season sales overview" in `T.text3`.

### Summary Stats Row (4 KPI chips)

Compute from all tickets data:
1. **Total Sold** — sum of all sold across all tiers all events
2. **Total Revenue** — sum of (sold × price) for all tiers, formatted as currency
3. **Avg Fill Rate** — average of (totalSold / totalCapacity) per event, shown as percentage
4. **Sold-Out Events** — count of events where every tier is fully sold

Style: horizontal row of 4 chips. Each chip: white surface, tier1 shadow, 12px radius, Lucide icon + metric + label. Same KPI card pattern as dashboard.

### Main Tickets Table / Card List

This is the key section. For each event (sorted by date):

**On desktop (>= 768px): Use a card-table hybrid**

A full-width card with a table inside. Headers:
| Event | Date | Venue | Tier Breakdown | Fill Rate | Revenue | Status |

Row design:
- Event name (bold) + link to `/events/[id]`
- Date formatted (short: "14 Jun")
- Venue section pill
- Tier Breakdown: small inline chips for each tier, e.g. `VIP 38/50` `General 210/450` — use `font-family: var(--font-mono)` for counts
- Fill rate: a thin progress bar (100px wide) with percentage label
  - Color: green < 50% ... no wait. Higher fill = better. Color:
    - < 50%: `T.warn`/gray
    - 50–85%: `T.success`
    - > 85%: `T.accent` (high demand)
    - 100%: `T.danger` (sold out)
- Revenue: formatted currency, `T.text`, mono font
- Status pill: "Sold Out" (danger, bold), "Almost Full" (warn, if > 85%), "On Sale" (success), "Upcoming" (info)

Table rows: alternating background (white / `T.surface2`), hover `T.surface3`.

**On mobile (< 768px): Stacked event cards**

Each event gets its own card:
- Event title + date
- Small tier pills row
- Fill bar
- Revenue

### Tier Breakdown Detail Section

Below the main table, add a "Revenue by Tier Type" summary section:

Aggregate across all events by tier name:
- VIP: total sold, total revenue, avg fill rate
- General: same
- Backstage Pass (if exists): same

Show as horizontal cards, one per tier type. Each card has a distinctive style:
- VIP: gold/warn tint background
- General: surface2 background
- Backstage: accent tint background

### Sort Control (client component)

Extract a small `TicketSortControl` client component that wraps the table and provides sort buttons:
- Sort by: Date (default), Fill Rate (highest first), Revenue (highest first), Event Name

Pass the full joined data array from server → client component as props.

---

## Data Joining

Join events + tickets + singers server-side:

```ts
import eventsData from "@/data/events.json";
import singersData from "@/data/singers.json";
import ticketsData from "@/data/tickets.json";
import type { Event, Singer, EventTickets } from "@/lib/types";

type EventRow = {
  event: Event;
  headliner: Singer | undefined;
  tickets: EventTickets | undefined;
  totalSold: number;
  totalCapacity: number;
  fillRate: number;      // 0–1
  revenue: number;
  isSoldOut: boolean;
};
```

Build this array server-side and pass it to the sort control client component as the initial data.

---

## Constraints

- Server component for data; client component (`TicketSortControl`) for sort interactivity
- The ticket detail per event (full tier breakdown) already lives on the event detail page — this overview page should be summary-oriented, not duplicate the full detail view
- Do NOT add "Purchase" or "Refund" buttons — read-only
- Use `font-family: var(--font-mono)` (JetBrains Mono) for all numeric data (counts, prices, percentages) to make it feel like a real data dashboard

---

## After writing the file

`cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | grep -E "error TS|Error:" | head -20`
