import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/nav/AppShell";
import { Calendar, Clock, MapPin, Mic2, Ticket, Users } from "lucide-react";
import eventsData from "@/data/events.json";
import singersData from "@/data/singers.json";
import ticketsData from "@/data/tickets.json";
import type { Event, Singer, EventTickets } from "@/lib/types";
import { formatTime, formatCurrency, getEventGradient } from "@/lib/utils";

const events = eventsData as Event[];
const singers = singersData as Singer[];
const ticketsAll = ticketsData as EventTickets[];

function formatLongDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTierStyle(name: string): { bg: string; color: string } {
  if (name === "VIP") return { bg: "var(--warn-tint)", color: "var(--warn)" };
  if (name.startsWith("Backstage")) return { bg: "var(--accent-tint-2)", color: "var(--accent)" };
  return { bg: "var(--surface-3)", color: "var(--text-3)" };
}

function getAvailabilityColor(pct: number): string {
  if (pct < 50) return "var(--success)";
  if (pct <= 85) return "var(--warn)";
  return "var(--danger)";
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = events.find((e) => e.id === id);
  if (!event) notFound();

  const headliner = singers.find((s) => s.id === event.headlinerId);
  const supports = event.supportIds
    .map((sid) => singers.find((s) => s.id === sid))
    .filter(Boolean) as Singer[];
  const et = ticketsAll.find((t) => t.eventId === event.id);

  const gradient = getEventGradient(event.id);
  const totalRevenue = et ? et.tiers.reduce((sum, t) => sum + t.sold * t.price, 0) : 0;
  const allSoldOut = et ? et.tiers.every((t) => t.sold >= t.total) : false;

  return (
    <AppShell>
      <div style={{ maxWidth: "900px" }}>
        {/* Back link */}
        <Link
          href="/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-3)",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            marginBottom: "20px",
          }}
        >
          ← Events
        </Link>

        {/* Hero banner */}
        <div
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            background: gradient,
            marginBottom: "24px",
          }}
        >
          <div style={{ height: "320px", position: "relative" }}>
            {/* Scrim */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)",
              }}
            />

            {/* Venue badge */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "24px",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "99px",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              {event.venueSection}
            </div>

            {/* Text overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "28px",
                left: "24px",
                right: "24px",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  margin: "0 0 8px",
                  textShadow: "0 2px 16px rgba(0,0,0,0.35)",
                }}
              >
                {event.title}
              </h1>
              <div
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                {formatLongDate(event.date)} · {formatTime(event.startTime)} –{" "}
                {formatTime(event.endTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* ── Left: Lineup ── */}
          <div className="flex-1 min-w-0">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <Mic2 size={18} color="var(--accent)" />
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Tonight's Lineup
              </h2>
            </div>

            {/* Headliner card */}
            {headliner && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--border)",
                  boxShadow:
                    "0 1px 2px rgba(26,18,9,0.06), 0 4px 12px rgba(26,18,9,0.08)",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: "var(--accent-tint-2)",
                    color: "var(--accent)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "99px",
                    letterSpacing: "0.06em",
                    marginBottom: "12px",
                  }}
                >
                  HEADLINER
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: gradient,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 10px rgba(26,18,9,0.15)",
                    }}
                  >
                    <Mic2 size={24} color="rgba(255,255,255,0.82)" strokeWidth={1.5} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: "6px",
                      }}
                    >
                      {headliner.name}
                    </div>

                    {/* Genre pills */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      {headliner.genre.map((g) => (
                        <span
                          key={g}
                          style={{
                            background: "var(--surface-3)",
                            color: "var(--text-3)",
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "3px 9px",
                            borderRadius: "99px",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Bio snippet */}
                    <p
                      style={{
                        color: "var(--text-2)",
                        fontSize: "13px",
                        lineHeight: 1.65,
                        margin: "0 0 10px",
                      }}
                    >
                      {headliner.bio.split(".")[0]}.
                    </p>

                    <Link
                      href={`/singers/${headliner.id}`}
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--accent)",
                        textDecoration: "none",
                      }}
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Support acts */}
            {supports.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--border)",
                  boxShadow:
                    "0 1px 2px rgba(26,18,9,0.06), 0 4px 12px rgba(26,18,9,0.08)",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: "var(--surface-3)",
                    color: "var(--text-3)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "99px",
                    letterSpacing: "0.06em",
                    marginBottom: "12px",
                  }}
                >
                  SUPPORT
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {supports.map((s) => (
                    <Link
                      key={s.id}
                      href={`/singers/${s.id}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "var(--surface-3)",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <Mic2 size={16} color="var(--text-4)" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "var(--text)",
                            }}
                          >
                            {s.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-4)" }}>
                            {s.genre.join(", ")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Info + Tickets ── */}
          <div style={{ width: "min(100%, 360px)", flexShrink: 0 }}>
            {/* Event Info Card */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                boxShadow:
                  "0 1px 2px rgba(26,18,9,0.06), 0 4px 12px rgba(26,18,9,0.08)",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              {/* Date */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  marginBottom: "11px",
                }}
              >
                <Calendar
                  size={15}
                  color="var(--accent)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <span style={{ fontSize: "14px", color: "var(--text-2)", fontWeight: 500 }}>
                  {formatLongDate(event.date)}
                </span>
              </div>

              {/* Times */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  marginBottom: "11px",
                }}
              >
                <Clock
                  size={15}
                  color="var(--text-4)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div style={{ fontSize: "14px", color: "var(--text-2)" }}>
                  Start {formatTime(event.startTime)} · End {formatTime(event.endTime)}
                </div>
              </div>

              {/* Venue */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  marginBottom: "11px",
                }}
              >
                <MapPin
                  size={15}
                  color="var(--text-4)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <span style={{ fontSize: "14px", color: "var(--text-2)" }}>
                  {event.venueSection}
                </span>
              </div>

              {/* Capacity */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <Users
                  size={15}
                  color="var(--text-4)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <span style={{ fontSize: "14px", color: "var(--text-2)" }}>
                  {event.totalCapacity.toLocaleString()} seats total
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  color: "var(--text-2)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  margin: "0 0 16px",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "14px",
                }}
              >
                {event.description}
              </p>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--text-4)",
                        fontSize: "12px",
                        fontWeight: 500,
                        padding: "4px 10px",
                        borderRadius: "99px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket Availability Card */}
            {et && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--border)",
                  boxShadow:
                    "0 1px 2px rgba(26,18,9,0.06), 0 4px 12px rgba(26,18,9,0.08)",
                  padding: "20px",
                }}
              >
                {/* Card title */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <Ticket size={16} color="var(--accent)" />
                  <span
                    style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}
                  >
                    Ticket Availability
                  </span>
                </div>

                {/* Tiers */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {et.tiers.map((tier) => {
                    const pct = Math.round((tier.sold / tier.total) * 100);
                    const tierSoldOut = tier.sold >= tier.total;
                    const barColor = tierSoldOut
                      ? "var(--danger)"
                      : getAvailabilityColor(pct);
                    const { bg, color } = getTierStyle(tier.name);

                    return (
                      <div key={tier.name}>
                        {/* Header row */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "7px",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center", gap: "7px" }}
                          >
                            <span
                              style={{
                                background: bg,
                                color,
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: "99px",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {tier.name}
                            </span>
                            {tierSoldOut && (
                              <span
                                style={{
                                  background: "var(--danger-tint)",
                                  color: "var(--danger)",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "99px",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "var(--text)",
                            }}
                          >
                            {formatCurrency(tier.price)}
                          </span>
                        </div>

                        {/* Availability bar */}
                        <div
                          style={{
                            height: "6px",
                            borderRadius: "99px",
                            background: "var(--surface-3)",
                            overflow: "hidden",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(pct, 100)}%`,
                              borderRadius: "99px",
                              background: barColor,
                            }}
                          />
                        </div>

                        {/* Stats row */}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-4)" }}>
                            {tier.sold} of {tier.total} sold
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-3)",
                              fontWeight: 500,
                            }}
                          >
                            {tier.total - tier.sold} available
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Join Waitlist — visual only, shown when all sold out */}
                {allSoldOut && (
                  <button
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: "var(--accent)",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      marginBottom: "14px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Join Waitlist
                  </button>
                )}

                {/* Total Revenue chip */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500 }}
                  >
                    Total Revenue
                  </span>
                  <span
                    style={{
                      background: "var(--success-tint)",
                      color: "var(--success)",
                      fontSize: "14px",
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: "99px",
                    }}
                  >
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
