"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import type { EnrichedEvent } from "@/app/showcase/_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "This Week", value: "week" },
  { label: "Next Month", value: "month" },
];

const CARD_PHOTOS = [
  "/showcase/events/sunset-crowd.webp",
  "/showcase/events/golden-watchers.webp",
  "/showcase/events/stage-lights.webp",
];

const TODAY = new Date().toISOString().split("T")[0];

function getWeekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function getMonthEnd(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

export function EventFilterBar({ events }: { events: EnrichedEvent[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const filter = params.get("filter") ?? "all";
  const genre = params.get("genre") ?? "";

  const allGenres = Array.from(
    new Set(events.flatMap((e) => e.event.tags ?? []))
  ).sort();

  function setFilter(f: string) {
    const p = new URLSearchParams(params.toString());
    p.set("filter", f);
    router.push(`?${p.toString()}`, { scroll: false });
  }

  function setGenre(g: string) {
    const p = new URLSearchParams(params.toString());
    if (g) p.set("genre", g);
    else p.delete("genre");
    router.push(`?${p.toString()}`, { scroll: false });
  }

  const weekEnd = getWeekEnd();
  const monthEnd = getMonthEnd();

  const filtered = events.filter((e) => {
    const date = e.event.date;
    if (filter === "week" && (date < TODAY || date > weekEnd)) return false;
    if (filter === "month" && (date < TODAY || date > monthEnd)) return false;
    if (genre && !(e.event.tags ?? []).includes(genre)) return false;
    return true;
  });

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`ss-sticky-pill${filter === f.value ? " is-active" : ""}`}
            style={{ cursor: "pointer", border: "none" }}
          >
            {f.label}
          </button>
        ))}
        {allGenres.length > 0 && (
          <>
            <span style={{ width: 1, background: "var(--ss-border)", margin: "0 0.25rem" }} />
            <button
              onClick={() => setGenre("")}
              className={`ss-sticky-pill${!genre ? " is-active" : ""}`}
              style={{ cursor: "pointer", border: "none" }}
            >
              All Genres
            </button>
            {allGenres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`ss-sticky-pill${genre === g ? " is-active" : ""}`}
                style={{ cursor: "pointer", border: "none" }}
              >
                {g}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Events count */}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--ss-ink-3)", marginBottom: "1.5rem" }}>
        {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--ss-ink-3)" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No events match your filter.</p>
          <button onClick={() => { setFilter("all"); setGenre(""); }} className="ss-sticky-pill is-active" style={{ cursor: "pointer", border: "none" }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="ss-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((e, i) => (
            <EventCard key={e.event.id} e={e} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ e, index }: { e: EnrichedEvent; index: number }) {
  const photo = CARD_PHOTOS[index % CARD_PHOTOS.length];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="ss-card"
    >
      <Link href={`/events/${e.event.id}`} className="ss-card-link">
        <div className="ss-card-top" style={{ background: "linear-gradient(135deg, #5C2A4E, #FF6B6B)" }}>
          <img src={photo} alt="" loading="lazy" decoding="async" className="ss-card-img" />
          <div className="ss-card-top-scrim" />
          <span className="ss-card-num">N° {String(e.event.id).replace("e", "").padStart(2, "0")}</span>
          <span className="ss-card-date">{formatDate(e.event.date).toUpperCase()}</span>
          {e.isSoldOut && (
            <span style={{
              position: "absolute",
              top: "0.85rem",
              right: "0.95rem",
              background: "rgba(229,57,53,0.9)",
              color: "white",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              padding: "0.28rem 0.55rem",
              borderRadius: 6,
              backdropFilter: "blur(8px)",
            }}>
              SOLD OUT
            </span>
          )}
        </div>
        <div className="ss-card-body">
          <h3 className="ss-card-title">{e.event.title}</h3>
          <div className="ss-card-headliner">
            with <strong>{e.headliner?.name ?? "TBA"}</strong>
          </div>
          <div className="ss-card-meta">
            <span>{e.event.venueSection}</span>
            <span aria-hidden="true">·</span>
            <span>{formatTime(e.event.startTime)}</span>
          </div>
          {(e.event.tags ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {(e.event.tags ?? []).map((tag) => (
                <span key={tag} style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  padding: "0.2rem 0.5rem",
                  background: "rgba(255,210,63,0.1)",
                  border: "1px solid rgba(255,210,63,0.2)",
                  borderRadius: 999,
                  color: "var(--ss-neon)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="ss-card-bar">
            <div className="ss-card-bar-track">
              <div className="ss-card-bar-fill" style={{ width: `${e.fillPct}%` }} />
            </div>
            <div className="ss-card-bar-meta">
              <span className="ss-bar-pct">{e.fillPct}% sold</span>
              <span className="ss-bar-remain">{e.remaining} left</span>
            </div>
          </div>
          <div className="ss-card-foot">
            <span className="ss-card-price">from {formatCurrency(e.cheapestPrice)}</span>
            <span className="ss-card-go">{e.isSoldOut ? "Sold Out" : "Reserve →"}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
