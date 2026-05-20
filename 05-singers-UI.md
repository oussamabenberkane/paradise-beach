# Agent 05 — Singers UI

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

Agents 01–03 are complete. The design system, data, navigation shell, and utilities are in place.

**Your job:** Build the Singers module — grid list page and individual artist detail page.

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
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
};
```

All cards: `border-radius: 16px`, `box-shadow: T.tier1`, background `T.surface`.
Genre pills: small pill, 10px padding H, 4px padding V, `T.accentTint2` background, `T.accent` text, 12px font, border-radius 99px.

---

## File 1: `src/app/singers/page.tsx`

Server component. Import singers.json and events.json.

### Layout

Wrap in `<AppShell>`. Page header:
- Title: "Artists" (h1, bold, `T.text`)
- Subtitle: "X artists performing this season" (count from data), `T.text3`
- Lucide `Mic2` icon next to title

### Filter Bar (client component — extract as `SingerFilterBar`)

3 filter chips:
- "All Genres" (default)
- Dynamically generated genre chips from all unique genres in the data (e.g., "Afrobeats", "Reggae", "Jazz", etc.)

The filter bar is a client component that manages selected genre state. When a genre is selected, filter the grid. Pass the full singers array as a prop from the server component, render the grid client-side inside the filter bar component.

### Singer Card Grid

Responsive grid: 2 cols on mobile, 3 on tablet (768px), 4 on desktop (1280px).

Each card:
- Hover: lift effect (Framer Motion: y -4, box-shadow increases to tier2), cursor pointer
- Click: navigate to `/singers/[id]`
- Photo: square aspect ratio, top of card, rounded top corners. Use a gradient placeholder (unique per singer — derive from name hash, warm colors). Show Lucide `Mic2` icon centered on the gradient as fallback
- Name: bold, 15px, `T.text`, below photo, padding 12px
- Genre pills: row below name
- Nationality: small text, `T.text4`, with a 🌍 emoji prefix
- Bottom: "X upcoming events" badge — small, accent color if > 0, gray if 0

Cards animate in with stagger: `y: 24 → 0, opacity: 0 → 1`, 0.06s delay per card.

---

## File 2: `src/app/singers/[id]/page.tsx`

Server component. Receives `params: { id: string }`.

Import all data, find singer by id. If not found, call `notFound()` from next/navigation.

### Layout

Wrap in `<AppShell>`. Back link: "← Artists" linking to `/singers`, `T.text3`, small.

### Hero Section

Wide card with two columns:
- Left: Large photo placeholder (240×240px circle, unique gradient per singer, `Mic2` icon centered). On desktop, centered in a decorative panel (surface2 background, wave pattern or just the gradient).
- Right:
  - Singer name: very large (36px+), bold, `T.text`
  - Nationality flag-ish: "Nationality" label + value
  - Genre pills (larger than in grid: 14px, more padding)
  - Bio: full paragraph, `T.text2`, 16px, good line-height (1.7)
  - Social links if present: Instagram and Spotify badges (Lucide `Instagram`, `Music2` icons)

### Upcoming Events

Section title: "Upcoming Events". Show events where this singer is headliner or support act:
- Find events where `headlinerId === singer.id` OR `supportIds.includes(singer.id)`
- Filter to only future dates (>= today)
- Sort by date ascending

For each event: a horizontal card with:
  - Date badge (pill, accent background, white text, bold)
  - Event title and venueSection
  - Role: "Headliner" (accent color badge) or "Support" (text3 badge)
  - Tickets left (calculate from tickets.json)
  - "View Event" link → `/events/[id]`

If no upcoming events: friendly message "No upcoming events scheduled. Check back soon! 🌊"

### Past Events (optional section)

Past events (< today) shown in a collapsed/grayed out strip. Same compact card style but muted colors.

---

## Data Loading

```ts
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import ticketsData from "@/data/tickets.json";
import type { Singer, Event, EventTickets } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
```

Helper: to get total available tickets for an event:
```ts
function getTicketsLeft(eventId: string, tickets: EventTickets[]): number {
  const et = tickets.find(t => t.eventId === eventId);
  if (!et) return 0;
  return et.tiers.reduce((sum, tier) => sum + (tier.total - tier.sold), 0);
}
```

---

## Constraints

- Server components for data-heavy parts; client components only for filter interactivity and hover animations
- Do NOT use real `<img>` for photos — use styled `<div>` with gradient backgrounds + icon
- Gradient generation for singer avatars: use a deterministic color based on `singer.id` (e.g., map s1→sunset orange, s2→teal, s3→purple, etc. — or just pick from a fixed palette of 10 warm/tropical colors)
- Do not add CRUD functionality — read-only

---

## After writing all files

`cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | grep -E "error TS|Error:" | head -20`
