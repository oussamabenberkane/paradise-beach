"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, getTickets } from "@/lib/admin-store";
import type { Event, EventTickets } from "@/lib/types";

function fillPct(sold: number, total: number) {
  if (total === 0) return 0;
  return Math.round((sold / total) * 100);
}

function FillBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? "var(--danger)" : pct >= 60 ? "var(--warn)" : "var(--success)";
  return (
    <div
      style={{
        height: "6px",
        background: "var(--surface-3)",
        borderRadius: "99px",
        overflow: "hidden",
        width: "80px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: "99px",
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

const tdInner: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.8125rem",
  color: "var(--text-3)",
};

export default function TicketsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<EventTickets[]>([]);

  useEffect(() => {
    setEvents(getEvents().sort((a, b) => a.date.localeCompare(b.date)));
    setTickets(getTickets());
  }, []);

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }

  function getTiers(eventId: string) {
    return tickets.find((t) => t.eventId === eventId)?.tiers ?? [];
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          marginBottom: "1.75rem",
        }}
      >
        Tickets
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {events.map((event) => {
          const tiers = getTiers(event.id);
          const totalSold = tiers.reduce((s, t) => s + t.sold, 0);
          const totalCap = tiers.reduce((s, t) => s + t.total, 0);
          const pct = fillPct(totalSold, totalCap);

          return (
            <div
              key={event.id}
              style={{
                background: "var(--surface)",
                borderRadius: "12px",
                boxShadow: "var(--tier-1)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Event header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderBottom: tiers.length > 0 ? "1px solid var(--border)" : "none",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--accent)",
                      background: "var(--accent-tint)",
                      padding: "3px 10px",
                      borderRadius: "99px",
                      flexShrink: 0,
                    }}
                  >
                    {formatDate(event.date)}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {event.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FillBar pct={pct} />
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--text-3)",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <Link
                    href={`/admin/tickets/${event.id}`}
                    style={{
                      padding: "0.375rem 1rem",
                      borderRadius: "6px",
                      background: "var(--accent-tint)",
                      color: "var(--accent)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Manage
                  </Link>
                </div>
              </div>

              {/* Tier mini-table */}
              {tiers.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr style={{ background: "var(--surface-2)" }}>
                        {["Tier", "Price", "Sold", "Total", "Fill"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                ...tdInner,
                                fontWeight: 700,
                                color: "var(--text-4)",
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                textAlign: "left",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((tier) => {
                        const p = fillPct(tier.sold, tier.total);
                        return (
                          <tr
                            key={tier.name}
                            style={{ borderTop: "1px solid var(--border)" }}
                          >
                            <td style={{ ...tdInner, fontWeight: 600, color: "var(--text-2)" }}>
                              {tier.name}
                            </td>
                            <td style={tdInner}>${tier.price}</td>
                            <td style={tdInner}>{tier.sold}</td>
                            <td style={tdInner}>{tier.total}</td>
                            <td style={tdInner}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <FillBar pct={p} />
                                <span style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>
                                  {p}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {tiers.length === 0 && (
                <div
                  style={{
                    padding: "0.875rem 1.25rem",
                    fontSize: "0.8125rem",
                    color: "var(--text-4)",
                  }}
                >
                  No tiers configured.{" "}
                  <Link
                    href={`/admin/tickets/${event.id}`}
                    style={{ color: "var(--accent)", fontWeight: 600 }}
                  >
                    Add tiers →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
