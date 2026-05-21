import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import ticketsData from "@/data/tickets.json";
import type { Singer, Event, EventTickets, TicketTier } from "@/lib/types";

export interface EnrichedEvent {
  event: Event;
  headliner: Singer | null;
  supports: Singer[];
  tickets: EventTickets | null;
  sold: number;
  capacity: number;
  fillPct: number;
  remaining: number;
  isSoldOut: boolean;
  topTier: TicketTier | null;
  cheapestPrice: number;
  revenue: number;
  startsAt: Date;
}

export interface ShowcaseData {
  events: EnrichedEvent[];
  upcoming: EnrichedEvent[];
  next: EnrichedEvent | null;
  topGrid: EnrichedEvent[];
  featured: Singer | null;
  featuredEventCount: number;
  stats: {
    upcomingCount: number;
    totalSold: number;
    totalCapacity: number;
    fillPct: number;
    totalRevenue: number;
    soldOutCount: number;
  };
}

const TODAY = "2026-05-20";

export function getShowcaseData(): ShowcaseData {
  const singers = singersData as Singer[];
  const events = eventsData as Event[];
  const tickets = ticketsData as EventTickets[];

  const singerById: Record<string, Singer> = Object.fromEntries(
    singers.map((s) => [s.id, s])
  );
  const ticketsByEventId: Record<string, EventTickets> = Object.fromEntries(
    tickets.map((t) => [t.eventId, t])
  );

  const enriched: EnrichedEvent[] = events
    .map((event): EnrichedEvent => {
      const t = ticketsByEventId[event.id] ?? null;
      const tiers = t?.tiers ?? [];
      const sold = tiers.reduce((s, x) => s + x.sold, 0);
      const capacity = tiers.reduce((s, x) => s + x.total, 0);
      const fillPct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
      const remaining = capacity - sold;
      const isSoldOut =
        capacity > 0 && tiers.every((x) => x.sold >= x.total);
      const topTier =
        tiers.length > 0 ? [...tiers].sort((a, b) => b.price - a.price)[0] : null;
      const cheapestPrice =
        tiers.length > 0 ? Math.min(...tiers.map((x) => x.price)) : 0;
      const revenue = tiers.reduce((s, x) => s + x.sold * x.price, 0);

      return {
        event,
        headliner: singerById[event.headlinerId] ?? null,
        supports: event.supportIds
          .map((id) => singerById[id])
          .filter(Boolean) as Singer[],
        tickets: t,
        sold,
        capacity,
        fillPct,
        remaining,
        isSoldOut,
        topTier,
        cheapestPrice,
        revenue,
        startsAt: new Date(`${event.date}T${event.startTime}:00`),
      };
    })
    .sort((a, b) => a.event.date.localeCompare(b.event.date));

  const upcoming = enriched.filter((e) => e.event.date >= TODAY);
  const next = upcoming[0] ?? null;
  const topGrid = upcoming.slice(0, 4);

  const counts: Record<string, number> = {};
  for (const e of upcoming) {
    if (e.event.headlinerId)
      counts[e.event.headlinerId] = (counts[e.event.headlinerId] ?? 0) + 1;
    for (const sid of e.event.supportIds)
      counts[sid] = (counts[sid] ?? 0) + 1;
  }
  const featuredId = Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const totalSold = enriched.reduce((s, e) => s + e.sold, 0);
  const totalCapacity = enriched.reduce((s, e) => s + e.capacity, 0);

  return {
    events: enriched,
    upcoming,
    next,
    topGrid,
    featured: featuredId ? singerById[featuredId] : null,
    featuredEventCount: featuredId ? counts[featuredId] : 0,
    stats: {
      upcomingCount: upcoming.length,
      totalSold,
      totalCapacity,
      fillPct:
        totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0,
      totalRevenue: enriched.reduce((s, e) => s + e.revenue, 0),
      soldOutCount: enriched.filter((e) => e.isSoldOut).length,
    },
  };
}
