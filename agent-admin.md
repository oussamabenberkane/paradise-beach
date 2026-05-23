# Agent: Paradise Beach — Admin CRUD Dashboard

## Context

You are working on **Paradise Beach**, a frontend-only Next.js app (no backend) that manages beach events, singers, and tickets. All data lives in JSON files under `/src/data/`. The app uses:

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 + inline CSS variables (defined in `src/app/globals.css`)
- Framer Motion for animations
- Lucide React for icons
- Fonts: Manrope (sans) + JetBrains Mono (mono)

### Current state

The app already has these **read-only user-facing pages** (do NOT touch them):

- `/` — dashboard homepage
- `/events` — events list
- `/events/[id]` — event detail
- `/singers` — artist grid
- `/singers/[id]` — singer profile
- `/tickets` — ticket analytics
- `/chat` — AI chat
- `/showcase` — design experiments (ignore)

### Your task

Build a complete `/admin` area with full CRUD for singers, events, and ticket tiers. The admin area uses a **separate layout** from the user-facing app.

---

## Design Tokens

All color and shadow tokens are in `src/app/globals.css`. Use CSS variables exclusively (no raw hex literals):

```
--bg, --surface, --surface-2, --surface-3
--border, --border-strong
--text, --text-2, --text-3, --text-4
--accent (#E8580C sunset orange), --accent-2, --accent-tint, --accent-tint-2
--success, --warn, --danger, --info (+ -tint variants)
--tier-1, --tier-2, --tier-3 (box-shadow values)
```

The admin UI should feel like a clean, warm management tool — use white surfaces (`--surface`), warm sand backgrounds (`--bg`), and `--accent` for primary actions. Tables, forms, and modals — not marketing pages.

---

## Data Shapes

```ts
// src/lib/types.ts (already exists — do not modify)
interface Singer {
  id: string;
  name: string;
  genre: string[];
  bio: string;
  photo: string;
  nationality: string;
  eventIds: string[];
  socialLinks?: { instagram?: string; spotify?: string };
}

interface Event {
  id: string;
  title: string;
  date: string;           // "YYYY-MM-DD"
  startTime: string;      // "HH:MM"
  endTime: string;
  headlinerId: string;
  supportIds: string[];
  venueSection: string;
  totalCapacity: number;
  description: string;
  coverImage: string;
  tags?: string[];
}

interface TicketTier {
  name: string;
  price: number;
  total: number;
  sold: number;
}

interface EventTickets {
  eventId: string;
  tiers: TicketTier[];
}
```

---

## 1. Data Layer — `/src/lib/admin-store.ts`

Create a shared localStorage-backed CRUD store. It initializes from the JSON files on first load and persists all changes to localStorage.

```ts
// Keys used in localStorage
const KEYS = {
  singers: "paradise.admin.singers",
  events:  "paradise.admin.events",
  tickets: "paradise.admin.tickets",
};
```

### Functions to implement

**Singers:**
```ts
getSingers(): Singer[]
getSinger(id: string): Singer | undefined
createSinger(data: Omit<Singer, "id" | "eventIds">): Singer
updateSinger(id: string, data: Partial<Omit<Singer, "id">>): Singer
deleteSinger(id: string): void
```

**Events:**
```ts
getEvents(): Event[]
getEvent(id: string): Event | undefined
createEvent(data: Omit<Event, "id">): Event
updateEvent(id: string, data: Partial<Omit<Event, "id">>): Event
deleteEvent(id: string): void
```

**Tickets:**
```ts
getTickets(): EventTickets[]
getTicketsByEvent(eventId: string): EventTickets | undefined
updateTiers(eventId: string, tiers: TicketTier[]): EventTickets
addTier(eventId: string, tier: TicketTier): EventTickets
removeTier(eventId: string, tierName: string): EventTickets
```

**ID generation:** use a simple incrementing ID based on existing max ID (e.g., if max singer id is "s10", next is "s11").

**Initialization logic:**
```ts
function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}
```

Also export a `resetStore()` function that clears all localStorage keys and reloads from JSON (useful for a "Reset to defaults" button in the admin).

---

## 2. Admin Layout — `/src/app/admin/layout.tsx`

Create a layout with a sticky left sidebar (on desktop) and a top bar (on mobile). The layout should wrap all `/admin/*` pages.

### Sidebar nav items
```
Overview          /admin
Singers           /admin/singers
Events            /admin/events
Tickets           /admin/tickets
────────────────
Reset Data        (button → calls resetStore())
← Back to app     /
```

### Styling requirements
- Sidebar: `--surface-2` background, `--border` right border, `width: 220px`
- Active link: `--accent-tint` background, `--accent` text
- Mobile: top bar with hamburger + drawer (use a simple `useState` toggle — no library)
- Top bar title: "Paradise · Admin"

---

## 3. Admin Overview — `/src/app/admin/page.tsx`

A simple stats page. Import data from the store (client component).

Show four stat cards:
- Total Singers
- Total Events
- Tickets Sold (sum across all events and tiers)
- Total Revenue (sum of `sold × price` across all tiers)

Below the stats, show a quick-access list: last 4 upcoming events (date ≥ today), each row linking to `/admin/events/[id]/edit`.

---

## 4. Singers CRUD

### `/src/app/admin/singers/page.tsx` — List
- Table with columns: Name, Genre, Nationality, Events, Actions
- "Add Singer" button (top right) → `/admin/singers/new`
- Each row has Edit (`/admin/singers/[id]/edit`) and Delete (confirm dialog) actions
- Search input to filter by name
- "Genre" is rendered as comma-separated tags

### `/src/app/admin/singers/new/page.tsx` — Create
- Form with fields:
  - Name (text, required)
  - Nationality (text)
  - Genre (comma-separated input → saved as array)
  - Bio (textarea)
  - Photo URL (text, placeholder "/images/singers/name.jpg")
  - Instagram handle (text)
  - Spotify handle (text)
- "Create Singer" submit button → calls `createSinger()` → redirect to `/admin/singers`
- "Cancel" link → back to list

### `/src/app/admin/singers/[id]/edit/page.tsx` — Edit
- Same form pre-filled with existing singer data
- "Save Changes" → `updateSinger()` → redirect to `/admin/singers`
- "Delete Singer" (danger button, confirm dialog) → `deleteSinger()` → redirect to list

---

## 5. Events CRUD

### `/src/app/admin/events/page.tsx` — List
- Table: Title, Date, Time, Venue, Headliner, Capacity, Actions
- "Add Event" button → `/admin/events/new`
- Edit + Delete per row
- Sort by date ascending

### `/src/app/admin/events/new/page.tsx` — Create
- Form fields:
  - Title (text, required)
  - Date (date input, required)
  - Start Time / End Time (time inputs)
  - Venue Section (text, e.g., "Main Stage")
  - Total Capacity (number)
  - Description (textarea)
  - Cover Image URL (text)
  - Tags (comma-separated input)
  - Headliner (select from `getSingers()` — show name options)
  - Support Acts (multi-select or tag input using singer names)
- On submit: `createEvent()` → redirect to `/admin/events`

### `/src/app/admin/events/[id]/edit/page.tsx` — Edit
- Same form pre-filled
- "Save Changes" + "Delete Event" (with confirm)

---

## 6. Tickets Management

### `/src/app/admin/tickets/page.tsx` — Overview
- List all events with their ticket tiers
- Each event row is expandable (or always open) showing a mini-table: Tier Name, Price, Sold, Total, Fill %
- "Manage" button per event → `/admin/tickets/[eventId]`

### `/src/app/admin/tickets/[eventId]/page.tsx` — Edit Tiers
- Show event title at top
- Editable table of tiers:
  - Name (text input), Price (number), Total (number), Sold (number, can be edited manually for mock purposes)
- "Add Tier" button (adds a new row)
- "Remove" per tier row
- "Save Tiers" → `updateTiers()` → show success toast
- Note: sold count is editable because this is mock data (admin may simulate sales)

---

## 7. Shared Components

Create these under `/src/components/admin/`:

**`ConfirmDialog.tsx`** — A simple modal with "Are you sure?" + Confirm/Cancel buttons. Accept `title`, `description`, `onConfirm`, `open`, `onClose` props. Use plain HTML dialog or a div with overlay (no external lib).

**`Toast.tsx`** — A simple top-right notification that auto-dismisses after 3s. Accept `message` and `type` ("success" | "error") props.

**`AdminTable.tsx`** — A reusable `<table>` wrapper with consistent `--tier-1` shadow, rounded corners, and header styling.

---

## 8. Implementation Notes

- All admin pages are **client components** (`"use client"`) since they read/write localStorage.
- Use `useEffect` to load data client-side (SSR can't access localStorage).
- For selects (headliner, support acts), load singers from the store on mount.
- Form validation: just `required` HTML attributes + basic JS guard before calling store functions. No external form library.
- No authentication needed — admin is open (this is a demo app).
- Do NOT use any external form, table, or modal libraries. Build everything from scratch using the design tokens.
- Do NOT modify files outside `/src/app/admin/`, `/src/components/admin/`, and `/src/lib/admin-store.ts`.

---

## Files to Create

```
src/
  lib/
    admin-store.ts                       ← localStorage CRUD utilities
  app/
    admin/
      layout.tsx                         ← admin shell with sidebar nav
      page.tsx                           ← overview stats
      singers/
        page.tsx                         ← singer list table
        new/page.tsx                     ← create singer form
        [id]/edit/page.tsx               ← edit singer form
      events/
        page.tsx                         ← event list table
        new/page.tsx                     ← create event form
        [id]/edit/page.tsx               ← edit event form
      tickets/
        page.tsx                         ← tickets overview
        [id]/page.tsx                    ← manage tiers for one event
  components/
    admin/
      ConfirmDialog.tsx
      Toast.tsx
      AdminTable.tsx
```

Start by creating `admin-store.ts`, then the layout, then each section in order (singers → events → tickets).
