# Agent 03 — Navigation UI

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

Agents 01 and 02 have already run. The design system is in place.

**Your job:** Build the two navigation components. Every page will import and use these.

---

## Design System Reference

Use this `T` object for all colors/shadows. Never use raw hex values in components.

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
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
};
```

The CSS vars are defined in `src/app/globals.css`. Beach palette: warm sand background (#FFF8F0), sunset orange accent (#E8580C).

---

## Files to Create

### 1. `src/components/nav/Sidebar.tsx`

**Desktop fixed left sidebar, 240px wide.**

Requirements:
- `"use client"` — uses `usePathname` from next/navigation
- Fixed position, full height, left side, z-index 40
- Background: `T.surface2`, right border: `1px solid var(--border)`
- Logo area at top: SVG wave icon (inline SVG, 3 stacked arcs in accent color) + "Paradise Beach" text in bold, `T.text` color. Below logo: small tagline "Beach Venue" in `T.text4`
- Nav items (use Lucide icons):
  - Dashboard → `/` → `LayoutDashboard` icon
  - Events → `/events` → `Calendar` icon
  - Singers → `/singers` → `Mic2` icon
  - Tickets → `/tickets` → `Ticket` icon
  - Chat → `/chat` → `MessageSquare` icon
- Each nav item: full-width, left-aligned, icon + label, padding 10px 16px, border-radius 10px, margin 2px 8px
- Active state: background `T.accentTint2`, text color `T.accent`, left border 3px solid `T.accent`
- Hover state: background `T.surface3`
- Active item detection: `usePathname()` — exact match for `/`, startsWith for others
- Bottom of sidebar: version chip "v1.0" and a small wave emoji or decoration
- Framer Motion: animate the sidebar mounting with `x: -20 → 0, opacity: 0 → 1`, duration 0.3s
- On mobile (< 768px): hidden (display none). Mobile navigation is handled by `TopBar`.

### 2. `src/components/nav/TopBar.tsx`

**Mobile bottom tab bar (visible only on mobile < 768px).**

Requirements:
- `"use client"` — uses `usePathname`
- Fixed position, bottom 0, full width, z-index 50
- Background: `T.surface`, top border: `1px solid var(--border)`
- 5 tabs (same items as Sidebar): Dashboard, Events, Singers, Tickets, Chat
- Each tab: icon centered above label, flex-1, padding 8px 4px
- Active state: icon and label in `T.accent`, icon has a small dot indicator below it (4px wide, 4px tall, rounded, accent color)
- Inactive state: `T.text4`
- Framer Motion: active tab indicator dot animates with `layoutId="mobile-tab-dot"` for smooth slide
- Safe area inset: add `padding-bottom: env(safe-area-inset-bottom)` to handle iPhone home bar
- Labels: small font, 10px, font-weight 600, truncated if needed

### 3. `src/components/nav/AppShell.tsx`

A layout shell component that wraps pages with the sidebar + main content area.

```tsx
"use client";
// Renders Sidebar on desktop + TopBar on mobile + main content
// Main content area: margin-left 240px on desktop, margin-bottom 64px on mobile
// Props: { children: React.ReactNode }
```

Design:
- Outer div: min-h-screen, background `T.bg`
- Desktop: `<Sidebar />` fixed left + main content with `margin-left: 240px`
- Mobile: main content full-width + `<TopBar />` fixed bottom
- Responsive via inline styles or Tailwind — both work. Use `@media (min-width: 768px)` breakpoint.
- Main area: `padding: 24px` on desktop, `padding: 16px 16px 80px` on mobile (bottom padding clears the tab bar)

---

## Usage Pattern

Every page component will import and use `AppShell`:

```tsx
import { AppShell } from "@/components/nav/AppShell";

export default function SomePage() {
  return (
    <AppShell>
      {/* page content */}
    </AppShell>
  );
}
```

---

## Constraints

- Use Framer Motion for the sidebar entrance animation and mobile tab dot transition only — do not over-animate
- No external icon libraries beyond lucide-react
- Do NOT create any page content — only the shell/navigation components
- The inline SVG wave logo should be simple (3 concentric arcs), not a full beach illustration

---

## After writing all files

Check TypeScript: `cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | grep -E "error TS|Error:" | head -20`
