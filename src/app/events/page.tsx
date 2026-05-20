import { AppShell } from "@/components/nav/AppShell";
import { EventFilterBar } from "@/components/events/EventFilterBar";
import { Calendar } from "lucide-react";
import eventsData from "@/data/events.json";
import singersData from "@/data/singers.json";
import ticketsData from "@/data/tickets.json";
import type { Event, Singer, EventTickets } from "@/lib/types";

const events = (eventsData as Event[]).sort((a, b) => a.date.localeCompare(b.date));
const singersMap = Object.fromEntries((singersData as Singer[]).map((s) => [s.id, s]));
const ticketsMap = Object.fromEntries((ticketsData as EventTickets[]).map((t) => [t.eventId, t]));

export default function EventsPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: "1200px" }}>
        {/* Page header */}
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <Calendar size={22} color="var(--accent)" strokeWidth={2} />
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Events
            </h1>
          </div>
          <p style={{ color: "var(--text-3)", fontSize: "14px", margin: 0 }}>
            {events.length} events this season
          </p>
        </div>

        <EventFilterBar events={events} singersMap={singersMap} ticketsMap={ticketsMap} />
      </div>
    </AppShell>
  );
}
