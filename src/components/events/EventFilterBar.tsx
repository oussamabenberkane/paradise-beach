"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Mic2 } from "lucide-react";
import type { Event, Singer, EventTickets } from "@/lib/types";
import { formatDate, formatTime, getEventGradient } from "@/lib/utils";

interface Props {
  events: Event[];
  singersMap: Record<string, Singer>;
  ticketsMap: Record<string, EventTickets>;
}

function getCapacityData(event: Event, ticketsMap: Record<string, EventTickets>) {
  const et = ticketsMap[event.id];
  if (!et) return { soldTotal: 0, pct: 0, isSoldOut: false };
  const soldTotal = et.tiers.reduce((s, t) => s + t.sold, 0);
  const pct = Math.round((soldTotal / event.totalCapacity) * 100);
  const isSoldOut = et.tiers.every((t) => t.sold >= t.total);
  return { soldTotal, pct, isSoldOut };
}

function EventCard({
  event,
  singer,
  ticketsMap,
  index,
}: {
  event: Event;
  singer: Singer | undefined;
  ticketsMap: Record<string, EventTickets>;
  index: number;
}) {
  const { pct, isSoldOut } = getCapacityData(event, ticketsMap);
  const gradient = getEventGradient(event.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        whileHover={{
          y: -4,
          boxShadow: "0 4px 16px rgba(26, 18, 9, 0.10), 0 12px 40px rgba(26, 18, 9, 0.14)",
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          boxShadow: "0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cover image area */}
        <div style={{ position: "relative", height: "180px", background: gradient, flexShrink: 0 }}>
          {/* Dark scrim at bottom */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
            }}
          />

          {/* Date pill — top left */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(0,0,0,0.40)",
              backdropFilter: "blur(8px)",
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: "99px",
            }}
          >
            <Calendar size={11} />
            {formatDate(event.date)}
          </div>

          {/* Sold out badge — top right */}
          {isSoldOut && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "var(--danger)",
                color: "white",
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "99px",
                letterSpacing: "0.05em",
              }}
            >
              SOLD OUT
            </div>
          )}

          {/* Title overlaid on scrim */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "14px",
              right: "14px",
            }}
          >
            <div
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                textShadow: "0 1px 6px rgba(0,0,0,0.45)",
              }}
            >
              {event.title}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Title */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            {event.title}
          </div>

          {/* Venue */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--text-4)",
              fontSize: "13px",
              marginBottom: "5px",
            }}
          >
            <MapPin size={12} />
            {event.venueSection}
          </div>

          {/* Time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--text-4)",
              fontSize: "13px",
              marginBottom: "5px",
            }}
          >
            <Clock size={12} />
            {formatTime(event.startTime)} → {formatTime(event.endTime)}
          </div>

          {/* Headliner */}
          {singer && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--text-3)",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "12px",
              }}
            >
              <Mic2 size={12} />
              {singer.name}
            </div>
          )}

          {/* Capacity bar */}
          <div style={{ marginTop: "auto", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  flex: 1,
                  height: "6px",
                  borderRadius: "99px",
                  background: "var(--surface-3)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(pct, 100)}%`,
                    borderRadius: "99px",
                    background: "var(--accent)",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-4)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {pct}% full
              </span>
            </div>
          </div>

          {/* View details link */}
          <Link
            href={`/events/${event.id}`}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            View Details →
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function EventFilterBar({ events, singersMap, ticketsMap }: Props) {
  const [timeFilter, setTimeFilter] = useState("All");
  const [venueFilter, setVenueFilter] = useState("All Venues");

  const uniqueVenues = Array.from(new Set(events.map((e) => e.venueSection))).sort();

  const filtered = events.filter((e) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (timeFilter === "Upcoming" && e.date < todayStr) return false;
    if (timeFilter === "This Week") {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEndStr = weekEnd.toISOString().split("T")[0];
      if (e.date < todayStr || e.date > weekEndStr) return false;
    }
    if (timeFilter === "This Month") {
      const eventDate = new Date(e.date + "T00:00:00");
      if (
        eventDate.getMonth() !== today.getMonth() ||
        eventDate.getFullYear() !== today.getFullYear()
      )
        return false;
    }
    if (venueFilter !== "All Venues" && e.venueSection !== venueFilter) return false;

    return true;
  });

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "99px",
    border: active ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
    background: active ? "var(--accent-tint-2)" : "var(--surface)",
    color: active ? "var(--accent)" : "var(--text-3)",
    fontSize: "13px",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08)",
  });

  return (
    <div>
      {/* Filter rows */}
      <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["All", "This Week", "This Month", "Upcoming"].map((f) => (
            <button key={f} onClick={() => setTimeFilter(f)} style={chipStyle(timeFilter === f)}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["All Venues", ...uniqueVenues].map((v) => (
            <button key={v} onClick={() => setVenueFilter(v)} style={chipStyle(venueFilter === v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "16px",
            padding: "48px 32px",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "15px",
            border: "1px dashed var(--border-strong)",
          }}
        >
          No events match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                singer={singersMap[event.headlinerId]}
                ticketsMap={ticketsMap}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
