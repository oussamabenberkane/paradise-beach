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
