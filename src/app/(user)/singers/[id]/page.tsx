import { notFound } from "next/navigation";
import Link from "next/link";
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import type { Singer, Event } from "@/lib/types";
import { getShowcaseData } from "@/app/showcase/_shared/data";
import { formatDate, formatCurrency, getEventGradient } from "@/lib/utils";
import { ExternalLink, Music } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const TODAY = new Date().toISOString().split("T")[0];

export default async function SingerDetailPage({ params }: Props) {
  const { id } = await params;
  const singers = singersData as Singer[];
  const singer = singers.find((s) => s.id === id);

  if (!singer) notFound();

  const { events } = getShowcaseData();
  const singerEvents = events.filter(
    (e) => e.event.headlinerId === id || e.event.supportIds.includes(id)
  );
  const upcomingEvents = singerEvents.filter((e) => e.event.date >= TODAY);

  const initials = singer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = (id.charCodeAt(1) * 37) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue},60%,20%), hsl(${(hue + 60) % 360},70%,35%))`;

  return (
    <div style={{ background: "var(--ss-bg)", minHeight: "100vh", paddingTop: "60px" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: "clamp(300px, 50vh, 520px)", background: gradient, overflow: "hidden" }}>
        {singer.photo && (
          <img
            src={singer.photo}
            alt={singer.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.9) 0%, rgba(10,10,12,0.2) 60%, transparent 100%)" }} />

        <div style={{ position: "absolute", bottom: "2.5rem", left: 0, right: 0, padding: "0 clamp(1.25rem, 5vw, 4rem)" }}>
          <Link href="/singers" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", letterSpacing: "0.14em", color: "rgba(255,241,184,0.65)", textDecoration: "none", marginBottom: "1rem" }}>
            ← ALL ARTISTS
          </Link>
          <h1 style={{ fontFamily: "var(--font-sans-sunset), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.95, letterSpacing: "-0.04em", color: "var(--ss-ink)", margin: "0 0 0.6rem", textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
            {singer.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.88rem", color: "rgba(255,241,184,0.65)" }}>{singer.nationality}</span>
            {singer.genre.map((g) => (
              <span key={g} style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", padding: "0.25rem 0.6rem", background: "rgba(255,210,63,0.12)", border: "1px solid rgba(255,210,63,0.25)", borderRadius: 999, color: "var(--ss-neon)" }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem clamp(1.25rem, 4vw, 3rem)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(min(100%, 320px), 340px)", gap: "3rem", alignItems: "start" }}>
          {/* Left */}
          <div>
            {/* Bio */}
            {singer.bio && (
              <section style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)" }}>ABOUT</span>
                  <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
                </div>
                <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--ss-ink-2)", maxWidth: "58ch" }}>
                  {singer.bio}
                </p>
              </section>
            )}

            {/* Upcoming events */}
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)" }}>
                  UPCOMING AT PARADISE BEACH
                </span>
                <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
              </div>

              {upcomingEvents.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--ss-ink-3)", background: "var(--ss-surface)", borderRadius: 16, border: "1px solid var(--ss-border)" }}>
                  <p style={{ margin: 0 }}>No upcoming shows scheduled.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {upcomingEvents.map((e) => {
                    const isHeadliner = e.event.headlinerId === id;
                    const eventGradient = getEventGradient(e.event.id);
                    return (
                      <Link
                        key={e.event.id}
                        href={`/events/${e.event.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem 1.25rem",
                          background: "var(--ss-surface)",
                          border: "1px solid var(--ss-border)",
                          borderRadius: 16,
                          textDecoration: "none",
                          color: "inherit",
                          transition: "border-color 0.18s, transform 0.18s",
                        }}
                        className="event-link-card"
                      >
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: eventGradient, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "var(--ss-ink)", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.event.title}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--ss-ink-3)", marginTop: "0.15rem" }}>
                            {formatDate(e.event.date)} · {e.event.venueSection}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
                          {isHeadliner && (
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", padding: "0.2rem 0.5rem", background: "rgba(255,210,63,0.12)", border: "1px solid rgba(255,210,63,0.25)", borderRadius: 999, color: "var(--ss-neon)" }}>
                              HEADLINER
                            </span>
                          )}
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ss-ink-2)" }}>
                            from {formatCurrency(e.cheapestPrice)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right — sidebar */}
          <div style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Stats */}
            <div style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: 20, padding: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)", marginBottom: "1rem" }}>QUICK STATS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <StatRow label="Total Shows" value={String(singerEvents.length)} />
                <StatRow label="Upcoming" value={String(upcomingEvents.length)} highlight />
                <StatRow label="Genres" value={singer.genre.join(", ")} />
              </div>
            </div>

            {/* Social links */}
            {(singer.socialLinks?.instagram || singer.socialLinks?.spotify) && (
              <div style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: 20, padding: "1.5rem" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)", marginBottom: "1rem" }}>FOLLOW</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {singer.socialLinks.instagram && (
                    <a
                      href={singer.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--ss-ink-2)", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, padding: "0.6rem 0.75rem", background: "rgba(255,241,184,0.04)", border: "1px solid var(--ss-border)", borderRadius: 10, transition: "border-color 0.18s, color 0.18s" }}
                      className="social-link"
                    >
                      <ExternalLink size={16} strokeWidth={1.8} />
                      Instagram
                    </a>
                  )}
                  {singer.socialLinks.spotify && (
                    <a
                      href={singer.socialLinks.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--ss-ink-2)", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, padding: "0.6rem 0.75rem", background: "rgba(255,241,184,0.04)", border: "1px solid var(--ss-border)", borderRadius: 10, transition: "border-color 0.18s, color 0.18s" }}
                      className="social-link"
                    >
                      <Music size={16} strokeWidth={1.8} />
                      Spotify
                    </a>
                  )}
                </div>
              </div>
            )}

            <Link href="/events" style={{ display: "flex", justifyContent: "center", padding: "0.85rem", background: "var(--ss-neon)", color: "#160B1F", borderRadius: 999, fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", textAlign: "center", boxShadow: "0 0 20px rgba(255,210,63,0.35)" }}>
              Browse All Events →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .event-link-card:hover {
          border-color: var(--ss-neon) !important;
          transform: translateX(4px);
        }
        .social-link:hover {
          border-color: var(--ss-neon) !important;
          color: var(--ss-neon) !important;
        }
      `}</style>
    </div>
  );
}

function StatRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: "0.82rem", color: "var(--ss-ink-3)" }}>{label}</span>
      <span style={{ fontSize: "0.92rem", fontWeight: 700, color: highlight ? "var(--ss-neon)" : "var(--ss-ink)" }}>{value}</span>
    </div>
  );
}
