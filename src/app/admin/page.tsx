"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSingers, getEvents, getTickets } from "@/lib/admin-store";
import type { Singer, Event, EventTickets } from "@/lib/types";

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: Stat) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "var(--tier-1)",
        border: "1px solid var(--border)",
        flex: "1 1 180px",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-4)",
            marginTop: "0.375rem",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function AdminOverview() {
  const [singers, setSingers] = useState<Singer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<EventTickets[]>([]);

  useEffect(() => {
    setSingers(getSingers());
    setEvents(getEvents());
    setTickets(getTickets());
  }, []);

  const totalSold = tickets.reduce(
    (sum, et) => sum + et.tiers.reduce((s, t) => s + t.sold, 0),
    0
  );
  const totalRevenue = tickets.reduce(
    (sum, et) =>
      sum + et.tiers.reduce((s, t) => s + t.sold * t.price, 0),
    0
  );

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  return (
    <div style={{ maxWidth: "860px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          marginBottom: "1.75rem",
        }}
      >
        Overview
      </h1>

      {/* Stat cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <StatCard label="Total Singers" value={singers.length} />
        <StatCard label="Total Events" value={events.length} />
        <StatCard
          label="Tickets Sold"
          value={totalSold.toLocaleString()}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
        />
      </div>

      {/* Upcoming events */}
      <div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "1rem",
          }}
        >
          Upcoming Events
        </h2>

        {upcoming.length === 0 ? (
          <p style={{ color: "var(--text-4)", fontSize: "0.875rem" }}>
            No upcoming events.
          </p>
        ) : (
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "12px",
              boxShadow: "var(--tier-1)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {upcoming.map((event, i) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/edit`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.875rem 1.25rem",
                  borderBottom:
                    i < upcoming.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  textDecoration: "none",
                  background: "transparent",
                  transition: "background 0.1s",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--accent)",
                    minWidth: "100px",
                    flexShrink: 0,
                  }}
                >
                  {formatDate(event.date)}
                </span>
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    flex: 1,
                  }}
                >
                  {event.title}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-4)",
                    flexShrink: 0,
                  }}
                >
                  {event.venueSection}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--accent)",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  Edit →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
