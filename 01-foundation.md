# Agent 01 — Foundation

## Context

You are building **Paradise Beach**, a polished frontend-only beach venue management dashboard.
Tech: Next.js 16 (App Router, TypeScript), Tailwind v4, Framer Motion, Lucide React.
Project root: `/home/ouss/Desktop/Coding/paradise`

The Next.js scaffold has already been run (pnpm, src/ dir, App Router, Tailwind v4).
Installed deps: `ai @ai-sdk/mistral framer-motion lucide-react clsx tailwind-merge`

**Your job:** Replace the default Next.js boilerplate and lay the design system foundation. No pages yet — just the base layer every other agent depends on.

---

## Files to create / replace

### 1. `src/app/globals.css`

Replace the default file entirely. This is the single source of truth for the design system.

Requirements:
- Import Tailwind v4: `@import "tailwindcss";`
- Define `@theme` block with font variables pointing to `--font-sans` and `--font-mono`
- Define all CSS custom properties in `:root` for the beach palette:

```css
:root {
  --bg: #FFF8F0;
  --surface: #FFFFFF;
  --surface-2: #FFF3E6;
  --surface-3: #FFE8CC;
  --border: rgba(26, 18, 9, 0.10);
  --border-strong: rgba(26, 18, 9, 0.20);

  --text: #1A1209;
  --text-2: #3D2B1F;
  --text-3: #7A5C45;
  --text-4: #A68B6E;

  --accent: #E8580C;
  --accent-2: #C94008;
  --accent-tint: rgba(232, 88, 12, 0.10);
  --accent-tint-2: rgba(232, 88, 12, 0.16);

  --success: #2D9E5F;
  --success-tint: rgba(45, 158, 95, 0.12);
  --warn: #F5A623;
  --warn-tint: rgba(245, 166, 35, 0.12);
  --danger: #E53935;
  --danger-tint: rgba(229, 57, 53, 0.12);
  --info: #1E88E5;
  --info-tint: rgba(30, 136, 229, 0.12);

  --tier-1: 0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08);
  --tier-2: 0 4px 16px rgba(26, 18, 9, 0.10), 0 12px 40px rgba(26, 18, 9, 0.14);
  --tier-3: 0 8px 32px rgba(26, 18, 9, 0.13), 0 24px 64px rgba(26, 18, 9, 0.16);
}
```

- Set `html, body` to use `var(--bg)` background, `var(--text)` color, `font-family: var(--font-sans, Manrope, sans-serif)`
- Custom scrollbar styles (webkit): thin, `var(--surface-3)` thumb, transparent track
- A `.sr-only` utility class for accessibility
- A `*` box-sizing reset

### 2. `src/app/layout.tsx`

Replace default. Requirements:
- Import `Manrope` and `JetBrains_Mono` from `next/font/google`
  - Manrope: variable `--font-sans`, weights 400/500/600/700/800, subsets latin
  - JetBrains_Mono: variable `--font-mono`, weights 400/500/600, subsets latin
- Apply both font variables to `<html>` className
- Import and wrap children with `AgentConversationProvider` from `@/components/dashboard/AgentConversationProvider`
- Metadata: `title: "Paradise Beach"`, `description: "Beach venue management — events, artists & tickets"`
- `lang="en"`

### 3. `src/lib/utils.ts`

Create this file with three exports:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string

export function formatDate(dateStr: string): string
// Input: "2026-06-14"
// Output: "Sun 14 Jun" (short weekday, day, short month)

export function formatCurrency(amount: number, currency = "EUR"): string
// Uses Intl.NumberFormat, locale "en-GB"
// Output: "€120" or "€1,200"

export function formatTime(timeStr: string): string
// Input: "19:00" → Output: "7:00 PM"
```

### 4. `src/lib/types.ts`

TypeScript interfaces matching the JSON data shape. Create:

```ts
export interface Singer {
  id: string;
  name: string;
  genre: string[];
  bio: string;
  photo: string;
  nationality: string;
  eventIds: string[];
  socialLinks?: { instagram?: string; spotify?: string };
}

export interface Event {
  id: string;
  title: string;
  date: string;           // "YYYY-MM-DD"
  startTime: string;      // "HH:mm"
  endTime: string;
  headlinerId: string;
  supportIds: string[];
  venueSection: string;
  totalCapacity: number;
  description: string;
  coverImage: string;
  tags?: string[];
}

export interface TicketTier {
  name: string;
  price: number;
  total: number;
  sold: number;
}

export interface EventTickets {
  eventId: string;
  tiers: TicketTier[];
}
```

### 5. `src/app/page.tsx`

Replace default with a simple redirect to keep the root clean. The dashboard IS the root page, so actually just put a minimal placeholder that says loading — Agent 04 will replace this fully.

```tsx
// placeholder — replaced by agent-04-dashboard-UI
export default function Home() {
  return null;
}
```

---

## Constraints

- Do NOT create any page components or navigation yet — those are other agents' jobs
- Do NOT add Geist fonts — use Manrope + JetBrains Mono only
- No dark mode variants — beach app is light-only
- No Tailwind dark mode config
- The `AgentConversationProvider` import in layout.tsx will error until Agent 02 creates it — that is acceptable, leave the import as-is

---

## After writing all files

Run `cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | tail -20` to verify no TypeScript errors in the foundation layer. The build will likely fail on missing providers/pages — that is expected. Fix only errors originating from the files you wrote.
