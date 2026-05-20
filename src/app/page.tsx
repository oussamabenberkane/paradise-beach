import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import ticketsData from "@/data/tickets.json";
import type { Singer, Event, EventTickets } from "@/lib/types";
import { AppShell } from "@/components/nav/AppShell";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { QuickChatWidget } from "@/components/dashboard/QuickChatWidget";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowRight,
  Star,
  ChevronRight,
} from "lucide-react";

const singers = singersData as Singer[];
const events = eventsData as Event[];
const tickets = ticketsData as EventTickets[];

const today = new Date().toISOString().split("T")[0];

// ── Stats ────────────────────────────────────────────
const upcomingEvents = events.filter((e) => e.date >= today);

const totalSold = tickets.reduce(
  (sum, et) => sum + et.tiers.reduce((s, t) => s + t.sold, 0),
  0
);
const totalCapacity = tickets.reduce(
  (sum, et) => sum + et.tiers.reduce((s, t) => s + t.total, 0),
  0
);
const fillPct = Math.round((totalSold / totalCapacity) * 100);
const totalRevenue = tickets.reduce(
  (sum, et) =>
    sum + et.tiers.reduce((s, t) => s + t.sold * t.price, 0),
  0
);

const stats = [
  {
    label: "Upcoming Events",
    value: String(upcomingEvents.length),
    icon: "calendar" as const,
  },
  {
    label: "Tickets Sold",
    value: totalSold.toLocaleString("en-GB"),
    icon: "ticket" as const,
  },
  {
    label: "Season Capacity",
    value: `${fillPct}% filled`,
    icon: "users" as const,
  },
  {
    label: "Total Revenue",
    value: formatCurrency(totalRevenue),
    icon: "trending" as const,
  },
];

// ── Next Up ──────────────────────────────────────────
const sortedUpcoming = [...upcomingEvents].sort((a, b) =>
  a.date.localeCompare(b.date)
);
const nextEvent = sortedUpcoming[0] as Event | undefined;
const nextEventTickets = nextEvent
  ? tickets.find((t) => t.eventId === nextEvent.id)
  : null;
const nextHeadliner = nextEvent
  ? singers.find((s) => s.id === nextEvent.headlinerId)
  : null;
const nextSold = nextEventTickets?.tiers.reduce((s, t) => s + t.sold, 0) ?? 0;
const nextTotal = nextEventTickets?.tiers.reduce((s, t) => s + t.total, 0) ?? 0;
const nextRemaining = nextTotal - nextSold;

// ── Recent Events Strip ──────────────────────────────
const recentStrip = sortedUpcoming.slice(0, 3);

// ── Featured Singer ──────────────────────────────────
const singerScores = singers.map((singer) => ({
  singer,
  count: upcomingEvents.filter(
    (e) => e.headlinerId === singer.id || e.supportIds.includes(singer.id)
  ).length,
}));
singerScores.sort((a, b) => b.count - a.count);
const featured = singerScores[0];

// ── Helpers ──────────────────────────────────────────
function getEventTickets(eventId: string) {
  return tickets.find((t) => t.eventId === eventId);
}
function capacityPct(eventId: string): number {
  const et = getEventTickets(eventId);
  if (!et) return 0;
  const sold = et.tiers.reduce((s, t) => s + t.sold, 0);
  const total = et.tiers.reduce((s, t) => s + t.total, 0);
  return Math.round((sold / total) * 100);
}

// Genre gradient backgrounds (cycle through warm palette)
const GENRE_GRADIENTS = [
  "linear-gradient(135deg, #E8580C 0%, #F5A623 100%)",
  "linear-gradient(135deg, #C94008 0%, #E8580C 100%)",
  "linear-gradient(135deg, #F5A623 0%, #E8580C 100%)",
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* ── Page Header ─────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-3)",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            Season overview
          </p>
        </div>

        {/* ── Section 1: Stats Row ─────────────────────── */}
        <section style={{ marginBottom: 28 }}>
          <StatsRow stats={stats} />
        </section>

        {/* ── Section 2: Next Up ──────────────────────── */}
        {nextEvent && (
          <section style={{ marginBottom: 28 }}>
            <SectionLabel>Next Up</SectionLabel>
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "var(--tier-2)",
                background: "var(--surface)",
              }}
              className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr]"
            >
              {/* Left: gradient cover */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #E8580C 0%, #F5A623 100%)",
                  padding: "40px 32px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: 220,
                }}
              >
                {/* Wave overlay */}
                <svg
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.15,
                    pointerEvents: "none",
                  }}
                  viewBox="0 0 400 260"
                  preserveAspectRatio="xMidYMid slice"
                  fill="none"
                >
                  <path
                    d="M0 80 Q100 30 200 80 Q300 130 400 80"
                    stroke="white"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M0 120 Q100 70 200 120 Q300 170 400 120"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0 160 Q100 110 200 160 Q300 210 400 160"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M0 200 Q100 150 200 200 Q300 250 400 200"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>

                {/* Date pill */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: 100,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "0.03em",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  NEXT EVENT
                </div>

                {/* Event title overlay */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                      textShadow: "0 2px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {nextEvent.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      marginTop: 6,
                      fontWeight: 500,
                    }}
                  >
                    {nextEvent.venueSection}
                  </div>
                </div>
              </div>

              {/* Right: details */}
              <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Date badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignSelf: "flex-start",
                    background: "var(--accent)",
                    borderRadius: 100,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "0.04em",
                  }}
                >
                  {formatDate(nextEvent.date).toUpperCase()}
                </div>

                {/* Event title */}
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {nextEvent.title}
                </h2>

                {/* Meta details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <DetailRow icon={<MapPin size={14} strokeWidth={2} />}>
                    {nextEvent.venueSection}
                  </DetailRow>
                  <DetailRow icon={<Clock size={14} strokeWidth={2} />}>
                    {formatTime(nextEvent.startTime)} → {formatTime(nextEvent.endTime)}
                  </DetailRow>
                  {nextHeadliner && (
                    <DetailRow
                      icon={
                        <Star size={14} strokeWidth={2} color="var(--warn)" />
                      }
                    >
                      {nextHeadliner.name}
                    </DetailRow>
                  )}
                </div>

                {/* Tickets remaining */}
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background:
                      nextRemaining < 50
                        ? nextRemaining < 20
                          ? "var(--danger-tint)"
                          : "var(--warn-tint)"
                        : "var(--success-tint)",
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      nextRemaining < 50
                        ? nextRemaining < 20
                          ? "var(--danger)"
                          : "var(--warn)"
                        : "var(--success)",
                    alignSelf: "flex-start",
                  }}
                >
                  {nextRemaining.toLocaleString("en-GB")} tickets remaining
                </div>

                {/* CTA */}
                <Link
                  href={`/events/${nextEvent.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    alignSelf: "flex-start",
                    background: "var(--accent)",
                    color: "white",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                    marginTop: "auto",
                  }}
                >
                  View Event
                  <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 3: Recent Events Strip ──────────── */}
        <section style={{ marginBottom: 28 }}>
          <SectionLabel href="/events">All Events</SectionLabel>
          <div
            style={{ gap: 14 }}
            className="grid grid-cols-1 md:grid-cols-3"
          >
            {recentStrip.map((event) => {
              const headliner = singers.find((s) => s.id === event.headlinerId);
              const pct = capacityPct(event.id);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  style={{
                    background: "var(--surface)",
                    borderRadius: 16,
                    padding: "18px 20px",
                    boxShadow: "var(--tier-1)",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "box-shadow 0.18s ease, transform 0.18s ease",
                  }}
                  className="event-strip-card"
                >
                  {/* Title + date */}
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {event.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-4)",
                        marginTop: 3,
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(event.date)}
                    </div>
                  </div>

                  {/* Headliner */}
                  {headliner && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-3)",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Star
                        size={12}
                        strokeWidth={2}
                        color="var(--accent)"
                        style={{ flexShrink: 0 }}
                      />
                      {headliner.name}
                    </div>
                  )}

                  {/* Capacity bar */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "var(--text-4)",
                        fontWeight: 600,
                        marginBottom: 5,
                      }}
                    >
                      <span>Capacity</span>
                      <span>{pct}%</span>
                    </div>
                    <div
                      style={{
                        height: 4,
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
                          background:
                            pct >= 90
                              ? "var(--danger)"
                              : pct >= 70
                              ? "var(--warn)"
                              : "var(--accent)",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Section 4+5: Chat Widget + Featured Singer ─ */}
        <section
          style={{ gap: 14 }}
          className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] items-stretch"
        >
          {/* Chat Widget */}
          <QuickChatWidget />

          {/* Featured Singer */}
          {featured && (
            <Link
              href={`/singers/${featured.singer.id}`}
              style={{
                background: "var(--surface)",
                borderRadius: 20,
                padding: "24px 26px",
                boxShadow: "var(--tier-1)",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Label */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-4)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                Featured Artist
              </div>

              {/* Avatar + name */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: GENRE_GRADIENTS[0],
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    boxShadow: "0 4px 16px rgba(232, 88, 12, 0.25)",
                  }}
                >
                  🎤
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "var(--text)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    {featured.singer.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-4)",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    {featured.singer.nationality}
                  </div>
                </div>
              </div>

              {/* Genre pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {featured.singer.genre.map((g) => (
                  <span
                    key={g}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--accent)",
                      background: "var(--accent-tint-2)",
                      borderRadius: 100,
                      padding: "3px 10px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Event count + link */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                  paddingTop: 4,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-3)",
                    fontWeight: 600,
                  }}
                >
                  {featured.count} upcoming event{featured.count !== 1 ? "s" : ""}
                </span>
                <ChevronRight size={16} color="var(--text-4)" strokeWidth={2} />
              </div>
            </Link>
          )}
        </section>

        {/* Bottom spacer */}
        <div style={{ height: 32 }} />
      </div>

      {/* Hover styles for event strip cards */}
      <style>{`
        .event-strip-card:hover {
          box-shadow: var(--tier-2) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────

function SectionLabel({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text-4)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {children}
      </h2>
      {href && (
        <Link
          href={href}
          style={{
            fontSize: 12,
            color: "var(--accent)",
            fontWeight: 600,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          View all <ChevronRight size={13} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        color: "var(--text-2)",
        fontWeight: 500,
      }}
    >
      <span style={{ color: "var(--text-4)", display: "flex", flexShrink: 0 }}>
        {icon}
      </span>
      {children}
    </div>
  );
}
