"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2 } from "lucide-react";
import type { Singer } from "@/lib/types";

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

interface SingerCardProps {
  singer: Singer;
  index: number;
  upcomingCount: number;
}

function SingerCard({ singer, index, upcomingCount }: SingerCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/singers/${singer.id}`} style={{ textDecoration: "none", display: "block" }}>
        <motion.div
          whileHover={{
            y: -4,
            boxShadow:
              "0 4px 16px rgba(26, 18, 9, 0.10), 0 12px 40px rgba(26, 18, 9, 0.14)",
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow:
              "0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Gradient avatar */}
          <div
            style={{
              aspectRatio: "1 / 1",
              background: getGradient(singer.id),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mic2 size={40} color="rgba(255,255,255,0.70)" strokeWidth={1.5} />
          </div>

          {/* Card body */}
          <div style={{ padding: "12px" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              {singer.name}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {singer.genre.map((g) => (
                <span
                  key={g}
                  style={{
                    background: "var(--accent-tint-2)",
                    color: "var(--accent)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "99px",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--text-4)",
                marginBottom: "8px",
              }}
            >
              🌍 {singer.nationality}
            </div>

            <span
              style={{
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 600,
                color: upcomingCount > 0 ? "var(--accent)" : "var(--text-4)",
                background:
                  upcomingCount > 0 ? "var(--accent-tint)" : "var(--surface-3)",
                padding: "4px 10px",
                borderRadius: "99px",
              }}
            >
              {upcomingCount} upcoming {upcomingCount === 1 ? "event" : "events"}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export interface SingerFilterBarProps {
  singers: Singer[];
  upcomingCountMap: Record<string, number>;
}

export function SingerFilterBar({ singers, upcomingCountMap }: SingerFilterBarProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const allGenres = Array.from(new Set(singers.flatMap((s) => s.genre))).sort();

  const filtered =
    selectedGenre === "All"
      ? singers
      : singers.filter((s) => s.genre.includes(selectedGenre));

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {["All", ...allGenres].map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            style={{
              padding: "8px 16px",
              borderRadius: "99px",
              border:
                selectedGenre === genre
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid var(--border)",
              background:
                selectedGenre === genre ? "var(--accent-tint-2)" : "var(--surface)",
              color: selectedGenre === genre ? "var(--accent)" : "var(--text-3)",
              fontSize: "13px",
              fontWeight: selectedGenre === genre ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow:
                "0 1px 2px rgba(26, 18, 9, 0.06), 0 4px 12px rgba(26, 18, 9, 0.08)",
            }}
          >
            {genre === "All" ? "All Genres" : genre}
          </button>
        ))}
      </div>

      {/* Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((singer, i) => (
            <SingerCard
              key={singer.id}
              singer={singer}
              index={i}
              upcomingCount={upcomingCountMap[singer.id] ?? 0}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
