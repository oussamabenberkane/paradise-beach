import { notFound } from "next/navigation";
import Link from "next/link";
import { getShowcaseData } from "@/app/showcase/_shared/data";
import { formatDate, formatCurrency, formatTime, getEventGradient } from "@/lib/utils";
import { TicketSelector } from "./TicketSelector";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const { events } = getShowcaseData();
  const enriched = events.find((e) => e.event.id === id);

  if (!enriched) notFound();

  const { event, headliner, supports, tickets, fillPct, remaining } = enriched;
  const gradient = getEventGradient(event.id);

  return (
    <div style={{ background: "var(--ss-bg)", minHeight: "100vh", paddingTop: "60px" }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: "clamp(320px, 55vh, 560px)",
          background: gradient,
          overflow: "hidden",
        }}
      >
        {event.coverImage && (
          <img
            src={event.coverImage}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}
        {/* Dark scrim */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,12,0.9) 0%, rgba(10,10,12,0.3) 50%, transparent 100%)" }} />

        <div style={{ position: "absolute", bottom: "2.5rem", left: 0, right: 0, padding: "0 clamp(1.25rem, 5vw, 4rem)" }}>
          <Link href="/events" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", letterSpacing: "0.14em", color: "rgba(255,241,184,0.65)", textDecoration: "none", marginBottom: "1rem" }}>
            ← ALL EVENTS
          </Link>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.22em", color: "var(--ss-neon)", marginBottom: "0.5rem" }}>
            N° {event.id.replace("e", "").padStart(2, "0")} · {formatDate(event.date).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: "var(--font-sans-sunset), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95, letterSpacing: "-0.04em", color: "var(--ss-ink)", margin: "0 0 0.5rem", textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
            {event.title}
          </h1>
          <div style={{ fontSize: "1rem", color: "rgba(255,241,184,0.75)" }}>
            {event.venueSection} · {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem clamp(1.25rem, 4vw, 3rem)", display: "grid", gridTemplateColumns: "1fr minmax(min(100%, 380px), 400px)", gap: "3rem", alignItems: "start" }}>
        {/* Left column */}
        <div>
          {/* Headliner section */}
          {headliner && (
            <section style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)" }}>HEADLINER</span>
                <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
              </div>
              <Link href={`/singers/${headliner.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "1.25rem", background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: 18, padding: "1.25rem", transition: "border-color 0.18s" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: gradient, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                  🎤
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--ss-ink)", letterSpacing: "-0.02em" }}>{headliner.name}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--ss-ink-3)", marginTop: "0.2rem" }}>{headliner.nationality}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.5rem" }}>
                    {headliner.genre.map((g) => (
                      <span key={g} style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.2rem 0.55rem", background: "rgba(255,210,63,0.1)", border: "1px solid rgba(255,210,63,0.2)", borderRadius: 999, color: "var(--ss-neon)" }}>{g}</span>
                    ))}
                  </div>
                </div>
              </Link>

              {supports.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", color: "var(--ss-ink-3)", marginBottom: "0.75rem" }}>SUPPORT ACTS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {supports.map((s) => (
                      <Link key={s.id} href={`/singers/${s.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ss-surface-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🎵</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--ss-ink)", fontSize: "0.92rem" }}>{s.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--ss-ink-3)" }}>{s.genre.join(", ")}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Event info */}
          <section style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)" }}>EVENT DETAILS</span>
              <span style={{ flex: 1, height: 1, background: "var(--ss-border)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <InfoTile label="DATE" value={formatDate(event.date)} />
              <InfoTile label="TIME" value={`${formatTime(event.startTime)} – ${formatTime(event.endTime)}`} />
              <InfoTile label="VENUE" value={event.venueSection} />
              <InfoTile label="AVAILABILITY" value={`${remaining} tickets left`} highlight={remaining < 50} />
            </div>
            {event.description && (
              <p style={{ fontSize: "0.98rem", lineHeight: 1.65, color: "var(--ss-ink-2)", maxWidth: "60ch" }}>
                {event.description}
              </p>
            )}
          </section>

          {/* Fill bar */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.18em", color: "var(--ss-ink-3)" }}>CAPACITY</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.18em", color: "var(--ss-neon)" }}>{fillPct}% SOLD</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,241,184,0.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${fillPct}%`, background: "linear-gradient(90deg, var(--ss-neon), var(--ss-neon-2))", borderRadius: 999, boxShadow: "0 0 12px rgba(255,210,63,0.4)", transition: "width 0.6s ease" }} />
            </div>
          </section>
        </div>

        {/* Right column — ticket selector */}
        <div style={{ position: "sticky", top: "5rem" }}>
          <div style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: 24, padding: "1.75rem", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)" }}>
            {tickets && tickets.tiers.length > 0 ? (
              <TicketSelector eventId={event.id} tiers={tickets.tiers} eventTitle={event.title} />
            ) : (
              <div style={{ textAlign: "center", color: "var(--ss-ink-3)", padding: "2rem 0" }}>
                <p>No tickets available for this event.</p>
              </div>
            )}
          </div>

          {/* Cheapest price hint */}
          {tickets && tickets.tiers.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.75rem", color: "var(--ss-ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              from {formatCurrency(enriched.cheapestPrice)} per ticket
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .event-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function InfoTile({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: "var(--ss-surface)", border: "1px solid var(--ss-border)", borderRadius: 14, padding: "0.9rem 1rem" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--ss-ink-3)", marginBottom: "0.35rem" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: highlight ? "var(--ss-neon)" : "var(--ss-ink)" }}>{value}</div>
    </div>
  );
}
