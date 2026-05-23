"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Singer } from "@/lib/types";
import type { EnrichedEvent } from "@/app/showcase/_shared/data";

interface SingerWithEventCount extends Singer {
  upcomingCount: number;
}

interface Props {
  singers: SingerWithEventCount[];
  allGenres: string[];
}

export function SingerFilterBar({ singers, allGenres }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const genre = params.get("genre") ?? "";

  function setGenre(g: string) {
    const p = new URLSearchParams(params.toString());
    if (g) p.set("genre", g);
    else p.delete("genre");
    router.push(`?${p.toString()}`, { scroll: false });
  }

  const filtered = genre
    ? singers.filter((s) => s.genre.includes(genre))
    : singers;

  return (
    <div>
      {/* Genre chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setGenre("")}
          className={`ss-sticky-pill${!genre ? " is-active" : ""}`}
          style={{ cursor: "pointer", border: "none" }}
        >
          All
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
      </div>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--ss-ink-3)", marginBottom: "1.5rem" }}>
        {filtered.length} artist{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {filtered.map((singer, i) => (
          <ArtistCard key={singer.id} singer={singer} index={i} />
        ))}
      </div>
    </div>
  );
}

function ArtistCard({ singer, index }: { singer: SingerWithEventCount; index: number }) {
  const initials = singer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = (singer.id.charCodeAt(1) * 37) % 360;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/singers/${singer.id}`}
        style={{
          display: "flex",
          flexDirection: "column",
          background: "var(--ss-surface)",
          border: "1px solid var(--ss-border)",
          borderRadius: 20,
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        }}
        className="artist-card"
      >
        {/* Avatar */}
        <div
          style={{
            aspectRatio: "4/3",
            background: `linear-gradient(135deg, hsl(${hue},60%,20%), hsl(${(hue + 60) % 360},70%,35%))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {singer.photo ? (
            <img
              src={singer.photo}
              alt={singer.name}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "3rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans-sunset), system-ui" }}>
              {initials}
            </span>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(22,11,31,0.8) 0%, transparent 50%)" }} />
          {singer.upcomingCount > 0 && (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "var(--ss-neon)", color: "#160B1F", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", padding: "0.25rem 0.55rem", borderRadius: 999 }}>
              {singer.upcomingCount} SHOW{singer.upcomingCount !== 1 ? "S" : ""}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--ss-ink)", margin: "0 0 0.2rem" }}>
            {singer.name}
          </h3>
          <div style={{ fontSize: "0.78rem", color: "var(--ss-ink-3)", marginBottom: "0.75rem" }}>
            {singer.nationality}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {singer.genre.slice(0, 3).map((g) => (
              <span key={g} style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.2rem 0.5rem", background: "rgba(255,210,63,0.08)", border: "1px solid rgba(255,210,63,0.15)", borderRadius: 999, color: "var(--ss-neon)" }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
