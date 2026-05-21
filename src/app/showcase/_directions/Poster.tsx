"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import "./poster.css";

const POSTER_PALETTES = [
  { key: "coral", bg: "#FF4D2E", paper: "#FFE5D1", ink: "#2A0F08", accent: "#FFB627" },
  { key: "marigold", bg: "#FFB627", paper: "#FFF5E1", ink: "#3D2400", accent: "#FF4D2E" },
  { key: "teal", bg: "#0B6E6E", paper: "#E1F2F2", ink: "#04201F", accent: "#FFB627" },
  { key: "plum", bg: "#5C2A4E", paper: "#F5E8F0", ink: "#1F0F1A", accent: "#FFB627" },
];

export function Poster({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;

  return (
    <div className="ps-root">
      <div className="ps-grain" aria-hidden="true" />

      {/* MARQUEE */}
      <div className="ps-marquee" aria-hidden="true">
        <div className="ps-marquee-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="ps-marquee-item">
              PARADISE BEACH
              <span className="ps-mq-dot">●</span>
              SUMMER &apos;26
              <span className="ps-mq-dot">●</span>
              TWELVE NIGHTS
              <span className="ps-mq-dot">●</span>
              ONE COAST
              <span className="ps-mq-dot">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="ps-hero">
        <div className="ps-hero-grid">
          <div className="ps-hero-left">
            <span className="ps-stamp">
              EST.
              <br />
              2026
            </span>
            <h1 className="ps-hero-title">
              TWELVE
              <br />
              NIGHTS.
              <br />
              ONE
              <br />
              COAST.
            </h1>
            <p className="ps-hero-deck">
              A summer programme of ten artists, three stages, and one
              uncompromising sunset. Curated for the season at Paradise Beach.
            </p>
            <div className="ps-hero-tickets">
              {next && (
                <Link
                  href={`/events/${next.event.id}`}
                  className="ps-ticket-stub ps-ticket-primary"
                >
                  <span className="ps-stub-num">
                    {next.event.date.slice(8, 10)}.
                    {next.event.date.slice(5, 7)}
                  </span>
                  <span className="ps-stub-divider" />
                  <span className="ps-stub-body">
                    <span className="ps-stub-event">
                      {next.event.title.toUpperCase()}
                    </span>
                    <span className="ps-stub-meta">
                      OPENS THE SEASON ↗
                    </span>
                  </span>
                </Link>
              )}
              <Link
                href="/chat"
                className="ps-ticket-stub ps-ticket-secondary"
              >
                <span className="ps-stub-icon">
                  <Sparkles size={16} strokeWidth={2.4} />
                </span>
                <span className="ps-stub-divider" />
                <span className="ps-stub-body">
                  <span className="ps-stub-event">ASK THE BOX OFFICE</span>
                  <span className="ps-stub-meta">AI · ALWAYS OPEN ↗</span>
                </span>
              </Link>
            </div>
          </div>

          {next && (
            <PosterCard event={next} palette={POSTER_PALETTES[0]} index={0} hero />
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="ps-stats" aria-label="Season at a glance">
        <div className="ps-stat-block">
          <span className="ps-stat-num">{stats.upcomingCount}</span>
          <span className="ps-stat-lbl">NIGHTS</span>
        </div>
        <div className="ps-stat-block">
          <span className="ps-stat-num">
            {stats.totalSold.toLocaleString("en-GB")}
          </span>
          <span className="ps-stat-lbl">SOLD</span>
        </div>
        <div className="ps-stat-block">
          <span className="ps-stat-num">
            {stats.fillPct}
            <i>%</i>
          </span>
          <span className="ps-stat-lbl">FULL</span>
        </div>
        <div className="ps-stat-block">
          <span className="ps-stat-num">
            {Math.round(stats.totalRevenue / 1000)}K<i>€</i>
          </span>
          <span className="ps-stat-lbl">REVENUE</span>
        </div>
      </section>

      {/* GRID */}
      <section className="ps-grid-section">
        <div className="ps-section-head">
          <span className="ps-section-eyebrow">★ THE PROGRAMME ★</span>
          <h2 className="ps-section-title">EVERY NIGHT IS A POSTER.</h2>
        </div>
        <div className="ps-grid">
          {topGrid.map((e, i) => (
            <PosterCard
              key={e.event.id}
              event={e}
              palette={POSTER_PALETTES[i % POSTER_PALETTES.length]}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* CHAT */}
      <section className="ps-chat">
        <div className="ps-chat-box">
          <div className="ps-chat-stamp">AI · BOX OFFICE</div>
          <h3 className="ps-chat-title">
            ASK
            <br />
            ANYTHING.
          </h3>
          <p className="ps-chat-body">
            Plain-language answers about every artist, every tier, every seat.
            Try a question, get an answer.
          </p>
          <div className="ps-chat-prompts">
            {["WHO'S PLAYING TONIGHT?", "VIPS LEFT FOR JUNE", "REGGAE IN JULY"].map(
              (p) => (
                <button key={p} className="ps-chat-prompt">
                  {p}
                </button>
              )
            )}
          </div>
          <Link href="/chat" className="ps-chat-cta">
            OPEN BOX OFFICE <ArrowUpRight size={16} strokeWidth={2.6} />
          </Link>
        </div>
      </section>

      <footer className="ps-footer">
        <span>PARADISE BEACH ✱ SUMMER &apos;26</span>
        <span>★ EST. 2026 ★</span>
        <span>PRINTED ON THE COAST</span>
      </footer>
    </div>
  );
}

function PosterCard({
  event: e,
  palette: p,
  index,
  hero = false,
}: {
  event: EnrichedEvent;
  palette: (typeof POSTER_PALETTES)[number];
  index: number;
  hero?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`ps-card ${hero ? "is-hero" : ""}`}
      style={{
        ["--ps-bg" as never]: p.bg,
        ["--ps-paper" as never]: p.paper,
        ["--ps-ink" as never]: p.ink,
        ["--ps-acc" as never]: p.accent,
      }}
    >
      <Link
        href={`/events/${e.event.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div className="ps-card-top">
          <span className="ps-card-num">
            N°{String(e.event.id).replace("e", "").padStart(2, "0")}
          </span>
          <span>{formatDate(e.event.date).toUpperCase().split(" ").slice(0, 2).join(" ")}</span>
        </div>

        <div className="ps-card-body">
          <h3 className="ps-card-title">{e.event.title.toUpperCase()}</h3>
          <div className="ps-card-headliner">
            ★ {e.headliner?.name?.toUpperCase() ?? "TBA"} ★
          </div>

          <div className="ps-card-meta-block">
            <div className="ps-card-meta-row">
              <span>STAGE</span>
              <span>{e.event.venueSection.toUpperCase()}</span>
            </div>
            <div className="ps-card-meta-row">
              <span>DOORS</span>
              <span>{formatTime(e.event.startTime)}</span>
            </div>
            <div className="ps-card-meta-row">
              <span>FROM</span>
              <span>{formatCurrency(e.cheapestPrice)}</span>
            </div>
          </div>

          <div className="ps-card-bar">
            <div
              className="ps-card-bar-fill"
              style={{ width: `${e.fillPct}%` }}
            />
          </div>
          <div className="ps-card-bar-meta">
            <span>{e.fillPct}% SOLD</span>
            <span>{e.remaining} LEFT</span>
          </div>
        </div>

        <div className="ps-card-footer">
          <span className="ps-card-stub">
            N° {String(e.event.id).replace("e", "").padStart(2, "0")}
          </span>
          <span className="ps-card-go">RESERVE →</span>
        </div>
      </Link>
    </motion.article>
  );
}
