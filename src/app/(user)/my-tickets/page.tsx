"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRegistrations, type Registration } from "@/lib/registrations-store";
import { formatCurrency } from "@/lib/utils";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];
const eventsById = Object.fromEntries(events.map((e) => [e.id, e]));

export default function MyTicketsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRegistrations(
      [...getRegistrations()].sort(
        (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
      )
    );
    setMounted(true);
  }, []);

  return (
    <div style={{ background: "var(--ss-bg)", minHeight: "100vh", paddingTop: "calc(4rem + 60px)", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 3rem)" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-sans-sunset), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.34em",
            color: "var(--ss-neon)",
            marginBottom: "1rem",
            textShadow: "0 0 14px rgba(255,210,63,0.45)",
          }}>
            ★ YOUR RESERVATIONS ★
          </span>
          <h1 style={{
            fontFamily: "var(--font-sans-sunset), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "var(--ss-ink)",
            margin: 0,
          }}>
            MY TICKETS
          </h1>
        </div>

        {!mounted ? null : registrations.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {registrations.map((reg) => (
              <TicketCard key={reg.id} reg={reg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketCard({ reg }: { reg: Registration }) {
  const event = eventsById[reg.eventId];
  const bookedDate = new Date(reg.bookedAt);
  const formattedBooked = bookedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div style={{
      background: "var(--ss-surface)",
      border: "1px solid var(--ss-border)",
      borderRadius: 20,
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "4px 1fr",
    }}>
      {/* Ticket stub left border */}
      <div style={{ background: "linear-gradient(180deg, var(--ss-neon) 0%, var(--ss-neon-2, #FF6B6B) 100%)" }} />

      <div style={{ padding: "1.5rem 1.5rem 1.5rem 1.25rem" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "1rem" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)", marginBottom: "0.3rem" }}>
              {event ? "EVENT" : "EVENT ID"}
            </div>
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--ss-ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event?.title ?? reg.eventId}
            </h2>
            {event && (
              <div style={{ fontSize: "0.78rem", color: "var(--ss-ink-3)", marginTop: "0.2rem" }}>
                {new Date(event.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()} · {event.venueSection}
              </div>
            )}
          </div>

          {/* Confirmation code */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--ss-ink-3)", marginBottom: "0.25rem" }}>CODE</div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.1em",
              color: "var(--ss-neon)",
              textShadow: "0 0 14px rgba(255,210,63,0.4)",
            }}>
              {reg.confirmationCode}
            </div>
          </div>
        </div>

        {/* Dashed divider */}
        <div style={{ borderTop: "1px dashed var(--ss-border)", margin: "0.75rem 0" }} />

        {/* Details row */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <DetailChip label="TIER" value={reg.tierName} />
            <DetailChip label="QTY" value={String(reg.quantity)} />
            <DetailChip label="BOOKED" value={formattedBooked} />
            <DetailChip label="NAME" value={reg.name} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--ss-ink-3)" }}>TOTAL</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem", color: "var(--ss-neon)" }}>
                {/* We don't store price in registration; show quantity */}
                {reg.quantity} ticket{reg.quantity !== 1 ? "s" : ""}
              </div>
            </div>
            {event && (
              <Link
                href={`/events/${reg.eventId}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.55rem 1rem",
                  background: "rgba(255,210,63,0.08)",
                  border: "1px solid rgba(255,210,63,0.2)",
                  borderRadius: 999,
                  color: "var(--ss-neon)",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                View Event →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--ss-ink-3)", marginBottom: "0.15rem" }}>{label}</div>
      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ss-ink-2)" }}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎟️</div>
      <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--ss-ink)", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
        No tickets yet
      </h2>
      <p style={{ color: "var(--ss-ink-3)", fontSize: "0.95rem", marginBottom: "2rem", maxWidth: "36ch", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
        Browse the lineup and reserve your spot before the strip sells out.
      </p>
      <Link
        href="/events"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.95rem 1.75rem",
          background: "var(--ss-neon)",
          color: "#160B1F",
          borderRadius: 999,
          fontWeight: 700,
          fontSize: "0.92rem",
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(255,210,63,0.4)",
        }}
      >
        Browse Events →
      </Link>
    </div>
  );
}
