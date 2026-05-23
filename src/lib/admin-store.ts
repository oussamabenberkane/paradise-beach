import singersJson from "@/data/singers.json";
import eventsJson from "@/data/events.json";
import ticketsJson from "@/data/tickets.json";
import type { Singer, Event, EventTickets, TicketTier } from "./types";

const KEYS = {
  singers: "paradise.admin.singers",
  events: "paradise.admin.events",
  tickets: "paradise.admin.tickets",
} as const;

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : fallback;
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(prefix: string, existing: { id: string }[]): string {
  const max = existing.reduce((m, x) => {
    const n = parseInt(x.id.replace(/\D/g, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `${prefix}${max + 1}`;
}

// ── Singers ──────────────────────────────────────────────────────────────────

export function getSingers(): Singer[] {
  return load<Singer>(KEYS.singers, singersJson as Singer[]);
}

export function getSinger(id: string): Singer | undefined {
  return getSingers().find((s) => s.id === id);
}

export function createSinger(data: Omit<Singer, "id" | "eventIds">): Singer {
  const singers = getSingers();
  const singer: Singer = { ...data, id: nextId("s", singers), eventIds: [] };
  save(KEYS.singers, [...singers, singer]);
  return singer;
}

export function updateSinger(
  id: string,
  data: Partial<Omit<Singer, "id">>
): Singer {
  const singers = getSingers();
  const idx = singers.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Singer ${id} not found`);
  singers[idx] = { ...singers[idx], ...data };
  save(KEYS.singers, singers);
  return singers[idx];
}

export function deleteSinger(id: string): void {
  save(KEYS.singers, getSingers().filter((s) => s.id !== id));
}

// ── Events ───────────────────────────────────────────────────────────────────

export function getEvents(): Event[] {
  return load<Event>(KEYS.events, eventsJson as Event[]);
}

export function getEvent(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id);
}

export function createEvent(data: Omit<Event, "id">): Event {
  const events = getEvents();
  const event: Event = { ...data, id: nextId("e", events) };
  save(KEYS.events, [...events, event]);
  return event;
}

export function updateEvent(
  id: string,
  data: Partial<Omit<Event, "id">>
): Event {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error(`Event ${id} not found`);
  events[idx] = { ...events[idx], ...data };
  save(KEYS.events, events);
  return events[idx];
}

export function deleteEvent(id: string): void {
  save(KEYS.events, getEvents().filter((e) => e.id !== id));
}

// ── Tickets ──────────────────────────────────────────────────────────────────

export function getTickets(): EventTickets[] {
  return load<EventTickets>(KEYS.tickets, ticketsJson as EventTickets[]);
}

export function getTicketsByEvent(eventId: string): EventTickets | undefined {
  return getTickets().find((t) => t.eventId === eventId);
}

export function updateTiers(
  eventId: string,
  tiers: TicketTier[]
): EventTickets {
  const tickets = getTickets();
  const idx = tickets.findIndex((t) => t.eventId === eventId);
  if (idx === -1) {
    const entry: EventTickets = { eventId, tiers };
    save(KEYS.tickets, [...tickets, entry]);
    return entry;
  }
  tickets[idx] = { ...tickets[idx], tiers };
  save(KEYS.tickets, tickets);
  return tickets[idx];
}

export function addTier(eventId: string, tier: TicketTier): EventTickets {
  const existing = getTicketsByEvent(eventId);
  return updateTiers(eventId, [...(existing?.tiers ?? []), tier]);
}

export function removeTier(eventId: string, tierName: string): EventTickets {
  const existing = getTicketsByEvent(eventId);
  if (!existing) throw new Error(`Tickets for event ${eventId} not found`);
  return updateTiers(
    eventId,
    existing.tiers.filter((t) => t.name !== tierName)
  );
}

export function resetStore(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}
