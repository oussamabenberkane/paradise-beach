import { Suspense } from "react";
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import type { Singer, Event } from "@/lib/types";
import { SingerFilterBar } from "./SingerFilterBar";

const TODAY = new Date().toISOString().split("T")[0];

export default function SingersPage() {
  const singers = singersData as Singer[];
  const events = eventsData as Event[];
  const upcoming = events.filter((e) => e.date >= TODAY);

  const singersWithCount = singers.map((s) => ({
    ...s,
    upcomingCount: upcoming.filter(
      (e) => e.headlinerId === s.id || e.supportIds.includes(s.id)
    ).length,
  }));

  const allGenres = Array.from(new Set(singers.flatMap((s) => s.genre))).sort();

  return (
    <div style={{ background: "var(--ss-bg)", minHeight: "100vh", paddingTop: "calc(4rem + 60px)", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 3rem)" }}>
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
            ★ PARADISE BEACH · SUMMER &apos;26 ★
          </span>
          <h1 style={{
            fontFamily: "var(--font-sans-sunset), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3rem, 8vw, 6rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "var(--ss-ink)",
            margin: 0,
          }}>
            THE ARTISTS
          </h1>
        </div>

        <Suspense fallback={<div style={{ color: "var(--ss-ink-3)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.18em" }}>Loading artists…</div>}>
          <SingerFilterBar singers={singersWithCount} allGenres={allGenres} />
        </Suspense>
      </div>

      <style>{`
        .artist-card:hover {
          transform: translateY(-4px);
          border-color: var(--ss-neon) !important;
          box-shadow: 0 0 0 1px var(--ss-neon), 0 20px 40px -16px rgba(255,210,63,0.3) !important;
        }
      `}</style>
    </div>
  );
}
