You are a senior full-stack engineer tasked with building **Paradise Beach** — a polished, frontend-only app to manage beach events, singers, and ticket sales, enhanced by a conversational AI interface that lets users explore and query the data through chat.

You have full autonomy to make technical and product decisions when needed. However:

* If you deviate from the initial plan, you MUST justify your reasoning.
* If anything is unclear or ambiguous, ask questions before proceeding.
* Always optimize for **clarity, maintainability, and design quality**.

---

# 1. PRODUCT VISION

Paradise Beach is a **beach venue management dashboard** that centralizes:

* Singer/artist management
* Event scheduling and details
* Ticket sales and capacity tracking
* A conversational AI layer to explore all of the above through natural language

There is **no backend**. All data lives in local JSON files. The AI chat does not call external APIs — it reasons over the in-memory JSON data.

---

# 2. CORE FEATURES

### Must-have (MVP)

* **Singers module** — browse artist profiles (name, bio, genre, photo, past events)
* **Events module** — list and detail view of beach events (date, time, headliner, support acts, venue section, capacity)
* **Tickets module** — per-event ticket tiers (VIP, General, etc.) with sold/available counts
* **AI Chat interface** — users chat with the data in natural language ("Who is playing this weekend?", "How many VIP tickets are left for Saturday?", "Show me all reggae artists")
* **Dashboard** — summary stats (upcoming events, total tickets sold, featured artist)

### Out of scope (MVP)

* Authentication
* Real payment flows
* Backend / database
* Admin CRUD (read-only for now)

---

# 3. TECH STACK

### Core

* **Next.js** (App Router, TypeScript)
* **No backend** — all data in `/src/data/*.json`
* **AI chat** — Vercel AI SDK (`ai`, `@ai-sdk/google` or `@ai-sdk/mistral`) with streaming, reasoning over JSON context injected into the system prompt
* **Styling** — Tailwind CSS v4 + inline style tokens (see Design section)
* **Animations** — Framer Motion
* **Icons** — Lucide React

### Design & Chat — cloned from `orkestra`

Lift and adapt the following directly from `/home/ouss/Desktop/Work/app-suisse/orkestra/src`:

| Source | What to take |
|--------|-------------|
| `app/chat/page.tsx` | Full chat UI shell — TopBar, Sidebar, Composer, MessageBubble, ThinkingIndicator, scroll-to-bottom pill, autoscroll logic |
| `app/chat/markdown.tsx` | Custom zero-dependency markdown renderer |
| `app/chat/voice-input.ts` | Web Speech API voice input |
| `app/globals.css` | Global CSS tokens, Tailwind config, scrollbar styles |
| `app/layout.tsx` | Root layout, Manrope + JetBrains Mono fonts |
| `components/dashboard/AgentConversationProvider.tsx` | Shared conversation context |
| `components/dashboard/agent-types.ts` | Message, Conversation, ToolCall types |
| `agent/memory/store.ts` + `agent/memory/types.ts` | localStorage memory adapter |

**Retheme** the "Plinth" design tokens for a beach/sunset palette (keep the same token structure, swap the colors):

```js
const T = {
  bg: "#FFF8F0",           // warm sand
  surface: "#FFFFFF",
  surface2: "#FFF3E6",     // light peach sidebar
  surface3: "#FFE8CC",     // hover

  text: "#1A1209",
  text2: "#3D2B1F",
  text3: "#7A5C45",
  text4: "#A68B6E",

  accent: "#E8580C",       // sunset orange (primary CTA)
  success: "#2D9E5F",
  warn: "#F5A623",
  danger: "#E53935",
  info: "#1E88E5",

  // keep same shadow tier structure from orkestra
};
```

Keep **Manrope** as the UI font and **JetBrains Mono** for code/data chips.

---

# 4. DATA MODEL (JSON)

All mock data lives in `/src/data/`. Design the JSON files to be realistic and rich enough to make the chat feel useful.

### `/src/data/singers.json`
```jsonc
[
  {
    "id": "s1",
    "name": "Aïcha Kouyaté",
    "genre": ["Afrobeats", "Soul"],
    "bio": "...",
    "photo": "/images/singers/aicha.jpg",   // use placeholder images
    "nationality": "Senegalese",
    "eventIds": ["e1", "e3"]
  },
  // 8–10 singers total, mix of genres
]
```

### `/src/data/events.json`
```jsonc
[
  {
    "id": "e1",
    "title": "Sunset Groove",
    "date": "2026-06-14",
    "startTime": "19:00",
    "endTime": "23:30",
    "headlinerId": "s1",
    "supportIds": ["s2"],
    "venueSection": "Main Stage",
    "totalCapacity": 500,
    "description": "...",
    "coverImage": "/images/events/sunset-groove.jpg"
  },
  // 10–12 events spanning June–August 2026
]
```

### `/src/data/tickets.json`
```jsonc
[
  {
    "eventId": "e1",
    "tiers": [
      { "name": "VIP", "price": 120, "total": 50, "sold": 38 },
      { "name": "General", "price": 45, "total": 450, "sold": 210 }
    ]
  }
]
```

---

# 5. AI CHAT

The chat interface reasons over the JSON data. No external tool calls or API queries — the agent receives the full dataset as context in the system prompt and answers questions using it.

### System prompt structure

```
You are the Paradise Beach assistant. You have full knowledge of all singers, events, and ticket data below.

Answer questions in a friendly, beach-vibes tone. Be concise and helpful.

## Singers
{JSON.stringify(singers)}

## Events
{JSON.stringify(events)}

## Tickets
{JSON.stringify(tickets)}
```

### Example queries the chat must handle well

* "Who is headlining this weekend?"
* "How many VIP tickets are left for Sunset Groove?"
* "Show me all reggae artists performing in July"
* "What's the total revenue if all General tickets for August sell out?"
* "Give me a summary of tonight's lineup"

### Tool calls (optional, stretch goal)

If the chosen model supports tool use, add lightweight tools:
* `search_events(query)` — filter events by keyword/date/genre
* `get_ticket_availability(eventId)` — return tier breakdown
* `get_singer_profile(singerId)` — return full profile

Use ThinkingIndicator from orkestra to show live tool execution (relabel to beach-appropriate French/English labels).

---

# 6. APP STRUCTURE

```
src/
  app/
    layout.tsx              ← root layout (fonts, global styles)
    page.tsx                ← dashboard (stats + upcoming events)
    chat/
      page.tsx              ← chat interface (from orkestra, rethemed)
      layout.tsx
      markdown.tsx
      voice-input.ts
    singers/
      page.tsx              ← singer grid
      [id]/page.tsx         ← singer detail
    events/
      page.tsx              ← event list
      [id]/page.tsx         ← event detail + ticket tiers
    tickets/
      page.tsx              ← tickets overview (all events)
  components/
    dashboard/
      AgentConversationProvider.tsx
      agent-types.ts
    ui/                     ← shadcn button, dialog, badge
    nav/
      Sidebar.tsx           ← app navigation sidebar
      TopBar.tsx            ← mobile top bar
  agent/
    memory/
      store.ts
      types.ts
    system-prompt.ts        ← builds system prompt from JSON data
  data/
    singers.json
    events.json
    tickets.json
  lib/
    utils.ts                ← cn(), formatDate(), formatCurrency()
```

---

# 7. UI REQUIREMENTS

### Navigation

* Desktop: fixed left sidebar (240px) with links to Dashboard, Events, Singers, Tickets, Chat
* Mobile: bottom tab bar (Dashboard, Events, Chat, Menu)

### Dashboard page

* Stats row: upcoming events count, total tickets sold this season, % capacity filled
* "Next up" event card (headliner photo, date, time, tickets left)
* Recent activity strip (last 3 events)
* Quick-access chat input that deep-links to `/chat`

### Events list

* Card grid, each card: cover image, date badge, title, headliner name, capacity bar
* Filter chips: All / This Week / This Month / By Genre

### Singer grid

* Photo card with name, genre tags, upcoming event count
* Click → detail page with bio, genre pills, upcoming events list

### Tickets overview

* Table or card list: event name, date, tier breakdown, sold/total bars, revenue

### Chat (`/chat`)

* Full-screen, lifted directly from orkestra with beach retheme
* Suggested prompts on welcome screen relevant to beach/events domain
* Memory drawer (can store user preferences like "I always want ticket prices in EUR")

---

# 8. DESIGN PRINCIPLES

* **Beach aesthetic, not kitschy** — warm palette, clean typography, no tacky wave clipart
* Mobile-first, same 820px breakpoint from orkestra for chat sidebar
* Consistent use of the T token object for all colors (no raw hex literals outside T)
* Cards use `tier1` shadow treatment from orkestra
* Accent color (sunset orange) for CTAs, active nav states, and capacity bars
* Use Framer Motion for page transitions and card hover lifts

---

# 9. EXECUTION STRATEGY

### Step 1: Scaffold

* `pnpm create next-app paradise-beach --typescript --tailwind --app`
* Install: `ai @ai-sdk/google framer-motion lucide-react clsx tailwind-merge`
* Copy and adapt orkestra source files listed in Section 3

### Step 2: Data

* Write all JSON files with realistic mock data (10 singers, 12 events, matching tickets)
* Build `system-prompt.ts` that loads JSON and interpolates into prompt string

### Step 3: Pages

* Dashboard → Singers → Events → Tickets → Chat (in this order)
* Each page: data loading (import JSON directly) → layout → components

### Step 4: Chat integration

* Wire Vercel AI SDK route at `app/api/chat/route.ts`
* Use `streamText` with system prompt from Step 2
* Connect to adapted orkestra chat UI

### Step 5: Polish

* Apply beach retheme tokens
* Test on mobile viewport
* Verify chat handles all example queries from Section 5

---

# 10. END GOAL

Deliver a **visually polished, frontend-only beach event management app** that:

* Looks like a real product (not a demo)
* Has rich, believable mock data
* Lets any user explore the data through a smart, streaming chat interface
* Reuses and respects the architecture and design quality of orkestra

Start by:
1. Confirming you understand the orkestra source to reuse
2. Asking any clarifying questions
3. Scaffolding the project and writing the planning structure

Then proceed to implementation page by page.
