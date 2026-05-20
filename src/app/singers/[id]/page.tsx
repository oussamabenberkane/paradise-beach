import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/nav/AppShell";
import { Mic2, AtSign, Music2, ArrowLeft, MapPin, Ticket } from "lucide-react";
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import ticketsData from "@/data/tickets.json";
import type { Singer, Event, EventTickets } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const singers = singersData as Singer[];
const events = eventsData as Event[];
const tickets = ticketsData as EventTickets[];

const GRADIENTS: Record<string, string> = {
  s1: "linear-gradient(135deg, #F97316, #FBBF24)",
  s2: "linear-gradient(135deg, #0D9488, #06B6D4)",
  s3: "linear-gradient(135deg, #7C3AED, #EC4899)",
  s4: "linear-gradient(135deg, #EA580C, #F59E0B)",
  s5: "linear-gradient(135deg, #059669, #10B981)",
  s6: "linear-gradient(135deg, #1D4ED8, #6366F1)",
  s7: "linear-gradient(135deg, #D97706, #C2410C)",
  s8: "linear-gradient(135deg, #0284C7, #0891B2)",
  s9: "linear-gradient(135deg, #E11D48, #F472B6)",
  s10: "linear-gradient(135deg, #B45309, #D97706)",
};

function getGradient(id: string) {
  return GRADIENTS[id] ?? "linear-gradient(135deg, #E8580C, #FBBF24)";
}

function getTicketsLeft(eventId: string): number {
  const et = tickets.find((t) => t.eventId === eventId);
  if (!et) return 0;
  return et.tiers.reduce((sum, tier) => sum + (tier.total - tier.sold), 0);
}

export default async function SingerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const singer = singers.find((s) => s.id === id);
  if (!singer) notFound();

  const today = new Date().toISOString().split("T")[0];

  const singerEvents = events.filter(
    (e) => e.headlinerId === singer.id || e.supportIds.includes(singer.id)
  );

  const upcomingEvents = singerEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastEvents = singerEvents
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell>
      <div style={{ maxWidth: "900px" }}>
        {/* Back link */}
        <Link
          href="/singers"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-3)",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={14} />
          Artists
        </Link>

        {/* Hero card */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow:
              "0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Avatar panel */}
            <div
              className="md:w-72 shrink-0"
              style={{
                background: "var(--surface-2)",
                padding: "40px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: getGradient(singer.id),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 4px 16px rgba(26, 18, 9, 0.10), 0 12px 40px rgba(26, 18, 9, 0.14)",
                }}
              >
                <Mic2 size={56} color="rgba(255,255,255,0.75)" strokeWidth={1.5} />
              </div>
            </div>

            {/* Info panel */}
            <div style={{ padding: "32px", flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                  marginBottom: "10px",
                  lineHeight: 1.1,
                }}
              >
                {singer.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-3)",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "16px",
                }}
              >
                <MapPin size={14} />
                {singer.nationality}
              </div>

              {/* Genre pills — larger */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "20px",
                }}
              >
                {singer.genre.map((g) => (
                  <span
                    key={g}
                    style={{
                      background: "var(--accent-tint-2)",
                      color: "var(--accent)",
                      fontSize: "14px",
                      fontWeight: 700,
                      padding: "6px 14px",
                      borderRadius: "99px",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p
                style={{
                  color: "var(--text-2)",
                  fontSize: "15px",
                  lineHeight: 1.75,
                  marginBottom: "20px",
                  margin: "0 0 20px",
                }}
              >
                {singer.bio}
              </p>

              {/* Social links */}
              {singer.socialLinks && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {singer.socialLinks.instagram && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "var(--surface-3)",
                        padding: "8px 14px",
                        borderRadius: "99px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-3)",
                      }}
                    >
                      <AtSign size={14} />
                      {singer.socialLinks.instagram}
                    </div>
                  )}
                  {singer.socialLinks.spotify && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "var(--surface-3)",
                        padding: "8px 14px",
                        borderRadius: "99px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-3)",
                      }}
                    >
                      <Music2 size={14} />
                      {singer.socialLinks.spotify}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "16px",
            }}
          >
            Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: "15px",
                border: "1px dashed var(--border-strong)",
              }}
            >
              No upcoming events scheduled. Check back soon! 🌊
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {upcomingEvents.map((event) => {
                const isHeadliner = event.headlinerId === singer.id;
                const ticketsLeft = getTicketsLeft(event.id);

                return (
                  <div
                    key={event.id}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      boxShadow:
                        "0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Date badge */}
                    <div
                      style={{
                        background: "var(--accent)",
                        color: "white",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        flexShrink: 0,
                        textAlign: "center",
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(event.date)}
                    </div>

                    {/* Event info */}
                    <div style={{ flex: 1, minWidth: "120px" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "var(--text)",
                        }}
                      >
                        {event.title}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-3)",
                          marginTop: "2px",
                        }}
                      >
                        {event.venueSection}
                      </div>
                    </div>

                    {/* Role badge */}
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: isHeadliner ? "var(--accent)" : "var(--text-3)",
                        background: isHeadliner
                          ? "var(--accent-tint-2)"
                          : "var(--surface-3)",
                        padding: "4px 10px",
                        borderRadius: "99px",
                        flexShrink: 0,
                      }}
                    >
                      {isHeadliner ? "Headliner" : "Support"}
                    </div>

                    {/* Tickets left */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        color: "var(--text-4)",
                        flexShrink: 0,
                      }}
                    >
                      <Ticket size={13} />
                      {ticketsLeft} left
                    </div>

                    {/* View link */}
                    <Link
                      href={`/events/${event.id}`}
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--accent)",
                        textDecoration: "none",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      View Event →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-3)",
                marginBottom: "12px",
              }}
            >
              Past Events
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pastEvents.map((event) => {
                const isHeadliner = event.headlinerId === singer.id;
                return (
                  <div
                    key={event.id}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      opacity: 0.55,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-4)",
                        flexShrink: 0,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(event.date)}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        color: "var(--text-3)",
                        fontWeight: 500,
                      }}
                    >
                      {event.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-4)",
                        flexShrink: 0,
                      }}
                    >
                      {isHeadliner ? "Headliner" : "Support"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
