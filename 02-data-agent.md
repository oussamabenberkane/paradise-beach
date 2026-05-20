# Agent 02 — Data & Agent Layer

## Context

You are building **Paradise Beach**, a frontend-only beach venue management app.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Vercel AI SDK v6 (`ai`, `@ai-sdk/mistral`)

Agent 01 has already created:
- `src/lib/types.ts` — Singer, Event, EventTickets, TicketTier interfaces
- `src/lib/utils.ts` — cn, formatDate, formatCurrency, formatTime
- `src/app/globals.css` — beach design system CSS vars
- `src/app/layout.tsx` — fonts, wraps with AgentConversationProvider

**Your job:** Create all data files, the agent memory layer (adapted from orkestra), the conversation provider, the system-prompt builder, and the chat API route.

---

## 1. JSON Data Files

### `src/data/singers.json`

Create exactly 10 singers. Mix genres: Afrobeats, Reggae, Jazz, Electronic, Soul, Cumbia, R&B, Surf Rock, Bossa Nova, Pop. Make bios 2–3 sentences, vivid and specific. Use `/images/singers/<slug>.jpg` for photos (placeholder paths — no real images needed).

Shape (from `src/lib/types.ts`):
```json
{
  "id": "s1",
  "name": "Aïcha Kouyaté",
  "genre": ["Afrobeats", "Soul"],
  "bio": "Senegalese-born vocalist...",
  "photo": "/images/singers/aicha-kouyate.jpg",
  "nationality": "Senegalese",
  "eventIds": ["e1", "e3"],
  "socialLinks": { "instagram": "@aichakouyate", "spotify": "aicha-kouyate" }
}
```

Singer IDs: s1 through s10. Make names diverse and international. Assign each singer 1–3 eventIds. Make sure eventIds reference real event IDs you'll create below.

### `src/data/events.json`

Create exactly 12 events spanning June–August 2026. Include a mix of:
- Weekday evening events (19:00–22:30)
- Weekend late events (20:00–24:00)
- 3 events with 2 support acts, others with 1 or 0
- Venue sections: "Main Stage", "Beach Terrace", "Sunset Deck", "Cove Stage"
- Capacities: 300–800

Shape:
```json
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
  "description": "2–3 sentence description with beach vibe...",
  "coverImage": "/images/events/sunset-groove.jpg",
  "tags": ["afrobeats", "soul"]
}
```

Event IDs: e1 through e12. Dates should be realistic — don't cluster all 12 in one week. Spread them: 4 in June, 4 in July, 4 in August.

### `src/data/tickets.json`

One entry per event (12 entries). Each has 2–3 tiers. VIP always has fewer seats (30–80 total). General is the bulk (200–600). Some events have a "Backstage Pass" tier (10–20 total, high price).

Make sold counts realistic — some events nearly sold out, some ~50% full, a couple with VIP completely sold out.

Shape:
```json
{
  "eventId": "e1",
  "tiers": [
    { "name": "VIP", "price": 120, "total": 50, "sold": 48 },
    { "name": "General", "price": 45, "total": 450, "sold": 210 }
  ]
}
```

---

## 2. Agent Memory Layer (adapted from orkestra)

Source files at `/home/ouss/Desktop/Work/app-suisse/orkestra/src/`:
- `agent/memory/types.ts`
- `agent/memory/store.ts`

### `src/agent/memory/types.ts`

Copy verbatim from orkestra's `agent/memory/types.ts`. Change only:
- Storage key reference in comments if any mention orkestra — replace with "paradise-beach"

### `src/agent/memory/store.ts`

Copy from orkestra's `agent/memory/store.ts`. Change only:
- `const STORAGE_KEY = "paradise-beach.agent.memories.v1";`

---

## 3. Agent Types (adapted from orkestra)

### `src/components/dashboard/agent-types.ts`

Copy verbatim from `/home/ouss/Desktop/Work/app-suisse/orkestra/src/components/dashboard/agent-types.ts`.
No changes needed.

---

## 4. AgentConversationProvider (adapted from orkestra)

Source: `/home/ouss/Desktop/Work/app-suisse/orkestra/src/components/dashboard/AgentConversationProvider.tsx`

### `src/components/dashboard/AgentConversationProvider.tsx`

Copy from orkestra and make these changes only:

1. **Storage key**: Change `"orkestra.agent-test.conversations.v1"` → `"paradise-beach.conversations.v1"`

2. **API endpoint**: Change the fetch URL from `"/api/agent?stream=events"` → `"/api/chat?stream=events"`

3. **Interrupted message**: Change `"…(interrompu)"` → `"…(interrupted)"` and `"_(interrompu)_"` → `"_(interrupted)_"`

4. **Empty response**: Change `"_(réponse vide)_"` → `"_(empty response)_"`

5. **Default conversation title**: Change `"Nouvelle conversation"` → `"New conversation"`

Everything else stays the same — the NDJSON streaming protocol, localStorage persistence, abort handling, tool call accumulation, memory proposal draining.

---

## 5. Voice Input (adapted from orkestra)

### `src/app/chat/voice-input.ts`

Copy from `/home/ouss/Desktop/Work/app-suisse/orkestra/src/app/chat/voice-input.ts`.
Change only:
- `rec.lang = "fr-FR"` → `rec.lang = "en-US"`
- Update any comments referencing French/brokerage to be generic

---

## 6. System Prompt Builder

### `src/agent/system-prompt.ts`

```ts
import singers from "@/data/singers.json";
import events from "@/data/events.json";
import tickets from "@/data/tickets.json";
import type { Memory } from "@/agent/memory/types";

export function buildSystemPrompt(memories: Memory[] = []): string {
  const today = new Date().toISOString().split("T")[0];

  const memorySection =
    memories.length > 0
      ? `\n\n## Your notes about this user\n${memories.map((m) => `- [${m.kind}] ${m.name}: ${m.body}`).join("\n")}`
      : "";

  return `You are the Paradise Beach assistant — the AI concierge for a premium beach venue. Today is ${today}.

You have full knowledge of all singers, events, and ticket data below. Answer questions in a friendly, beach-vibes tone. Be concise, helpful, and specific. Use numbers when asked about capacity or ticket counts.

When a user says something like "remember that..." or "note that..." — use the save_memory tool to store their preference. When listing multiple items, use markdown lists. For data-heavy answers, use tables.

## Singers
${JSON.stringify(singers, null, 2)}

## Events
${JSON.stringify(events, null, 2)}

## Tickets
${JSON.stringify(tickets, null, 2)}${memorySection}`;
}
```

---

## 7. Chat API Route

### `src/app/api/chat/route.ts`

This route must implement the exact NDJSON event stream protocol that `AgentConversationProvider` expects (`?stream=events`). Study the AgentConversationProvider to understand the event shapes: `{ t: "text", d: "..." }`, `{ t: "tool-call", ... }`, `{ t: "finish", ... }`, `{ t: "error", ... }`.

```ts
import { createMistral } from "@ai-sdk/mistral";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/agent/system-prompt";
import type { Memory } from "@/agent/memory/types";

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export async function POST(req: Request) {
  const url = new URL(req.url);
  const streamEvents = url.searchParams.get("stream") === "events";

  let body: { messages: { role: string; content: string }[]; memories?: Memory[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { messages, memories = [] } = body;
  const systemPrompt = buildSystemPrompt(memories);

  if (!streamEvents) {
    // Default AI SDK data stream (for compatibility)
    const result = streamText({
      model: mistral("mistral-large-latest"),
      system: systemPrompt,
      messages: messages as Parameters<typeof streamText>[0]["messages"],
    });
    return result.toDataStreamResponse();
  }

  // NDJSON event stream — one JSON object per line
  // Protocol matches AgentConversationProvider expectations
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const result = streamText({
          model: mistral("mistral-large-latest"),
          system: systemPrompt,
          messages: messages as Parameters<typeof streamText>[0]["messages"],
        });

        for await (const chunk of result.textStream) {
          emit({ t: "text", d: chunk });
        }

        const usage = await result.usage;
        emit({
          t: "finish",
          finishReason: "stop",
          usage: {
            promptTokens: usage?.inputTokens,
            completionTokens: usage?.outputTokens,
            totalTokens: usage?.totalTokens,
          },
        });
      } catch (err) {
        emit({ t: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
```

Use model `"mistral-large-latest"`. The env var is `MISTRAL_API_KEY`.

---

## After writing all files

1. Create a `.env.local` at the project root with `MISTRAL_API_KEY=` (leave value empty — the user will fill it in).
2. Run `cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | tail -30`. Fix any TypeScript errors in the files you created. Import errors from missing page components are expected — ignore them.
