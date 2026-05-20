"use client";

import { useState } from "react";
import Link from "next/link";
import type { Singer, Event, EventTickets } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export type EventRow = {
  event: Event;
  headliner: Singer | null;
  tickets: EventTickets | null;
  totalSold: number;
  totalCapacity: number;
  fillRate: number;
  revenue: number;
  isSoldOut: boolean;
};

type SortKey = "date" | "fillRate" | "revenue" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "fillRate", label: "Fill Rate" },
  { key: "revenue", label: "Revenue" },
  { key: "name", label: "Event Name" },
];

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fillBarColor(rate: number): string {
  if (rate >= 1) return "var(--danger)";
  if (rate > 0.85) return "var(--accent)";
  if (rate >= 0.5) return "var(--success)";
  return "var(--warn)";
}

type StatusInfo = { label: string; color: string; bg: string };

function getEventStatus(row: EventRow, today: string): StatusInfo {
  if (row.isSoldOut)
    return { label: "Sold Out", color: "var(--danger)", bg: "var(--danger-tint)" };
  if (row.fillRate > 0.85)
    return { label: "Almost Full", color: "var(--warn)", bg: "var(--warn-tint)" };
  if (row.event.date >= today)
    return { label: "On Sale", color: "var(--success)", bg: "var(--success-tint)" };
  return { label: "Concluded", color: "var(--text-4)", bg: "var(--surface-3)" };
}

function sortRows(rows: EventRow[], key: SortKey): EventRow[] {
  return [...rows].sort((a, b) => {
    switch (key) {
      case "date":     return a.event.date.localeCompare(b.event.date);
      case "fillRate": return b.fillRate - a.fillRate;
      case "revenue":  return b.revenue - a.revenue;
      case "name":     return a.event.title.localeCompare(b.event.title);
    }
  });
}

export function TicketSortControl({
  rows,
  today,
}: {
  rows: EventRow[];
  today: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const sorted = sortRows(rows, sortKey);

  return (
    <div>
      {/* Sort toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-4)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginRight: 2,
          }}
        >
          Sort
        </span>
        {SORT_OPTIONS.map((opt) => {
          const active = sortKey === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                border: active
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid var(--border-strong)",
                background: active ? "var(--accent-tint-2)" : "var(--surface)",
                color: active ? "var(--accent)" : "var(--text-3)",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                letterSpacing: "-0.01em",
                boxShadow: active ? "none" : "var(--tier-1)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── Desktop table ──────────────────────────── */}
      <div
        className="hidden md:block"
        style={{
          background: "var(--surface)",
          borderRadius: 20,
          boxShadow: "var(--tier-1)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border-strong)",
              }}
            >
              {["Event", "Date", "Venue", "Tier Breakdown", "Fill Rate", "Revenue", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-4)",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const status = getEventStatus(row, today);
              const pct = Math.round(row.fillRate * 100);
              return (
                <tr
                  key={row.event.id}
                  style={{
                    background:
                      i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                    borderBottom:
                      i < sorted.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                  className="ticket-tr"
                >
                  {/* Event */}
                  <td style={{ padding: "14px 16px", minWidth: 160 }}>
                    <Link
                      href={`/events/${row.event.id}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text)",
                        textDecoration: "none",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.2,
                        display: "block",
                      }}
                      className="ticket-event-link"
                    >
                      {row.event.title}
                    </Link>
                    {row.headliner && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-4)",
                          marginTop: 3,
                          fontWeight: 500,
                        }}
                      >
                        {row.headliner.name}
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-2)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatShortDate(row.event.date)}
                    </span>
                  </td>

                  {/* Venue */}
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--accent)",
                        background: "var(--accent-tint)",
                        borderRadius: 100,
                        padding: "3px 10px",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {row.event.venueSection}
                    </span>
                  </td>

                  {/* Tier Breakdown */}
                  <td style={{ padding: "14px 16px", minWidth: 210 }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {row.tickets?.tiers.map((tier) => {
                        const full = tier.sold === tier.total;
                        return (
                          <span
                            key={tier.name}
                            style={{
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                              color: full ? "var(--danger)" : "var(--text-2)",
                              background: full
                                ? "var(--danger-tint)"
                                : "var(--surface-3)",
                              borderRadius: 6,
                              padding: "3px 8px",
                              whiteSpace: "nowrap",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {tier.name} {tier.sold}/{tier.total}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Fill Rate */}
                  <td style={{ padding: "14px 16px", minWidth: 150 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 100,
                          height: 5,
                          borderRadius: 100,
                          background: "var(--surface-3)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: 100,
                            background: fillBarColor(row.fillRate),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          color: "var(--text-2)",
                          minWidth: 34,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {formatCurrency(row.revenue)}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: status.color,
                        background: status.bg,
                        borderRadius: 100,
                        padding: "4px 12px",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ────────────────────────────── */}
      <div
        className="md:hidden"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {sorted.map((row) => {
          const status = getEventStatus(row, today);
          const pct = Math.round(row.fillRate * 100);
          return (
            <Link
              key={row.event.id}
              href={`/events/${row.event.id}`}
              style={{
                background: "var(--surface)",
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: "var(--tier-1)",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                border: "1px solid var(--border)",
              }}
            >
              {/* Title row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.event.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-4)",
                      marginTop: 3,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                    }}
                  >
                    {formatShortDate(row.event.date)} · {row.event.venueSection}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: status.color,
                    background: status.bg,
                    borderRadius: 100,
                    padding: "4px 10px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {status.label}
                </span>
              </div>

              {/* Tier pills */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {row.tickets?.tiers.map((tier) => {
                  const full = tier.sold === tier.total;
                  return (
                    <span
                      key={tier.name}
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: full ? "var(--danger)" : "var(--text-2)",
                        background: full ? "var(--danger-tint)" : "var(--surface-3)",
                        borderRadius: 6,
                        padding: "3px 8px",
                      }}
                    >
                      {tier.name} {tier.sold}/{tier.total}
                    </span>
                  );
                })}
              </div>

              {/* Fill bar + revenue */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 100,
                      background: "var(--surface-3)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 100,
                        background: fillBarColor(row.fillRate),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--text-2)",
                      minWidth: 34,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--text)",
                    flexShrink: 0,
                  }}
                >
                  {formatCurrency(row.revenue)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .ticket-tr { transition: background 0.12s ease; }
        .ticket-tr:hover { background: var(--surface-3) !important; }
        .ticket-event-link { transition: color 0.12s ease; }
        .ticket-event-link:hover { color: var(--accent) !important; }
      `}</style>
    </div>
  );
}
