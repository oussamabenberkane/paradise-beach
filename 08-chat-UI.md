# Agent 08 — Chat UI

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

All previous agents (01–07) have run. Everything is in place including:
- `AgentConversationProvider` at `src/components/dashboard/AgentConversationProvider.tsx`
- `useAgentConversation` hook exported from that file
- Agent memory: `src/agent/memory/store.ts` + `src/agent/memory/types.ts`
- Voice input: `src/app/chat/voice-input.ts`
- Chat API route: `src/app/api/chat/route.ts` (streaming NDJSON at `POST /api/chat?stream=events`)
- Navigation shell: `AppShell`, `Sidebar`, `TopBar` in `src/components/nav/`

**Your job:** Build the full-screen chat interface by adapting the orkestra chat page. The design language must be the same as orkestra's chat — same layout, same UX patterns, same memory drawer — but rethemed to beach palette and rephrased to English/beach domain.

---

## Source Reference

The original orkestra chat page is at:
`/home/ouss/Desktop/Work/app-suisse/orkestra/src/app/chat/page.tsx`

Read that file in full before writing. It is ~4,900 lines and represents the complete, polished reference implementation. Adapt it rather than rewriting from scratch.

The markdown renderer is at:
`/home/ouss/Desktop/Work/app-suisse/orkestra/src/app/chat/markdown.tsx`

---

## Files to Create

### 1. `src/app/chat/markdown.tsx`

Copy from orkestra's `app/chat/markdown.tsx` and adapt domain decorators:

Replace the orkestra domain-specific regex patterns:
```ts
// Remove:
const ID_RE = /\b(?:CLT|POL|SIN|PRM|REN|PROS|CMP)\d{3,6}\b|\bC00\d\b/g;
const AMOUNT_RE = /\b\d{1,3}(?:[  ]\d{3})*(?:[.,]\d+)?\s?(?:M|K)?\s?CHF\b/g;
const PERCENT_RE = /[+-]?\d+(?:[.,]\d+)?\s?(?:%|pt\b)/g;

// Replace with beach domain patterns:
const EVENT_ID_RE = /\be\d{1,2}\b/gi;  // event IDs like e1, e12
const PRICE_RE = /€\d+(?:[,]\d{3})*(?:\.\d+)?|\d+(?:[,]\d{3})*\s?EUR/g;
const PERCENT_RE = /[+-]?\d+(?:[.,]\d+)?\s?%/g;
const CAPACITY_RE = /\b\d{3,4}\s?(?:tickets?|seats?|capacity)\b/gi;
```

Update the rendering styles for beach theme:
- IDs/event refs: use accent orange chip style (previously blue in orkestra)
- Amounts: use the same mono chip style, accent tint background
- Percentages: keep the same mono treatment

Everything else in the renderer stays identical.

### 2. `src/app/chat/layout.tsx`

Simple layout — no extra wrapping needed since AppShell is used in page.tsx:

```tsx
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### 3. `src/app/chat/page.tsx`

Adapt from orkestra's `app/chat/page.tsx`. This is the most complex file. Read the source carefully.

**Key adaptations (change ONLY these things, keep everything else):**

#### A. T token object — replace with beach tokens:
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
  accent2: "var(--accent-2)",
  accentTint: "var(--accent-tint)",
  accentTint2: "var(--accent-tint-2)",
  success: "var(--success)",
  successTint: "var(--success-tint)",
  warn: "var(--warn)",
  warnTint: "var(--warn-tint)",
  danger: "var(--danger)",
  dangerTint: "var(--danger-tint)",
  info: "var(--info)",
  infoTint: "var(--info-tint)",
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
  // Keep gradient fields from orkestra — the blue gradient is only used for
  // the send button; replace with beach accent:
  gradient: "linear-gradient(135deg, #E8580C 0%, #C94008 100%)",
  gradientShadow:
    "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(201,64,8,0.35), 0 4px 14px -4px rgba(232,88,12,0.45)",
  gradientShadowHover:
    "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(201,64,8,0.35), 0 8px 20px -4px rgba(232,88,12,0.55)",
};
```

#### B. Remove the AppSidebar import
Orkestra imports `Sidebar as AppSidebar` from `@/components/dashboard/Sidebar`. Remove this import. The beach app has its own navigation via `AppShell` but the chat page is full-screen and does NOT include the nav sidebar — it is a standalone full-screen experience accessed from the nav.

The chat page itself already has its own conversation history sidebar built-in. That stays as-is.

#### C. Update suggested prompts (welcome screen)
Replace orkestra's BFSI-domain suggested prompts with beach/event prompts:

```ts
const SUGGESTED_PROMPTS = [
  { icon: Calendar,    label: "This weekend's lineup",   text: "Who is playing this weekend?" },
  { icon: Ticket,      label: "VIP availability",         text: "How many VIP tickets are left for each upcoming event?" },
  { icon: Mic2,        label: "Reggae artists",           text: "Show me all reggae artists performing this summer" },
  { icon: TrendingUp,  label: "Revenue forecast",         text: "What's the total revenue if all remaining General tickets sell out?" },
  { icon: Users,       label: "Headliners in July",       text: "Which artists are headlining events in July 2026?" },
  { icon: Sparkles,    label: "Tonight's vibe",           text: "Give me a full summary of the next event" },
];
```

Replace orkestra icons like `Building2`, `GitCompareArrows`, `BarChart3` with relevant lucide icons for the beach domain: `Calendar`, `Ticket`, `Mic2`, `TrendingUp`, `Users`, `Sparkles`, `MapPin`, `Music2`.

#### D. Welcome screen copy
- Title: "Paradise Beach Assistant" (replace whatever orkestra has)
- Subtitle: "Ask me anything about artists, events, and ticket availability"
- Remove any BFSI domain language

#### E. Memory drawer copy
Replace French memory kind labels:
- "preference" → "Preference"
- "watch" → "Watch"
- "saved-view" → "Saved View"
- "note" → "Note"

Replace French UI strings:
- "Nouvelle conversation" → "New conversation"
- "Mémoires" / "Mémoire" → "Memories"
- "Ajouter une mémoire" → "Add memory"
- "Préférence" → "Preference"
- Any other French strings → English equivalents

#### F. Tool activity indicator
Replace French tool labels with beach-appropriate ones. In orkestra, tool names are shown when executing. Since our agent has no custom tools (it reasons over context directly), the `activeTool` will rarely show. But if it does, the label should just show the tool name as-is.

Keep the ThinkingIndicator / activeTool bar exactly as orkestra has it — just make sure the styling uses the beach T tokens.

#### G. API endpoint
The `AgentConversationProvider` already calls `/api/chat?stream=events` (that was changed in agent 02). No changes needed to the API call in the page — it goes through the provider.

#### H. Page title / metadata
Set `document.title` or `<title>` to "Chat — Paradise Beach" if orkestra sets a custom title.

#### I. Sidebar width breakpoint
Orkestra uses 820px as the breakpoint for chat sidebar toggle. Keep this same breakpoint.

---

## What NOT to change

- The entire conversation flow logic — do not touch
- The NDJSON streaming handler — identical to orkestra
- localStorage persistence keys — already changed in AgentConversationProvider (agent 02)
- The memory store integration — identical pattern
- The autoscroll logic — keep exactly
- The voice input integration — keep exactly (just uses en-US from agent 02)
- The composer / textarea autogrow — keep exactly
- The message bubble actions (copy, edit, bookmark) — keep exactly, just update colors
- The conversation history sidebar layout — keep exactly

---

## Constraints

- This is a full-screen page — it does NOT use `<AppShell>`. The chat fills the viewport independently. The user navigates to `/chat` from the sidebar link and gets a full-screen chat experience. On the chat page itself, there's no app nav sidebar visible (by design — same as orkestra).
- Read the entire orkestra chat page before writing. Adapt, don't rewrite.
- The file will be long (~400–600 lines after adaptation). That is expected and fine.

---

## After writing all files

1. Run full build: `cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | tail -30`
2. Fix any TypeScript errors
3. Start dev server: `pnpm dev` and verify the chat page loads at `http://localhost:3000/chat`
4. Verify the page matches orkestra's layout (sidebar, composer, message bubbles, memory drawer) in beach theme
