"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Sun } from "lucide-react";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import "./noir.css";

export function Noir({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;

  const [clockText, setClockText] = useState("—:—");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const sunset = new Date(now);
      sunset.setHours(21, 14, 0, 0);
      if (sunset.getTime() <= now.getTime())
        sunset.setDate(sunset.getDate() + 1);
      const diff = sunset.getTime() - now.getTime();
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      setClockText(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="nr-root">
      <div className="nr-halo" aria-hidden="true">
        <div className="nr-halo-blob nr-halo-blob-1" />
        <div className="nr-halo-blob nr-halo-blob-2" />
        <div className="nr-halo-blob nr-halo-blob-3" />
      </div>
      <div className="nr-stars" aria-hidden="true" />

      {/* TOP */}
      <header className="nr-top">
        <div className="nr-top-brand">
          <div className="nr-brand-dot" />
          <span className="nr-brand-text">
            paradise<span>·</span>after dark
          </span>
        </div>
        <nav className="nr-top-nav" aria-label="Time horizon">
          <a className="nr-top-link is-active">Tonight</a>
          <a className="nr-top-link">Tomorrow</a>
          <a className="nr-top-link">This Week</a>
          <a className="nr-top-link">Season</a>
        </nav>
        <div className="nr-top-clock" aria-label="Time until sunset">
          <Sun size={14} strokeWidth={2.2} />
          <div className="nr-clock-time">
            <span className="nr-clock-num">{clockText}</span>
            <span className="nr-clock-lbl">until sunset</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="nr-hero">
        <div>
          <div className="nr-kicker">
            <span /> tonight at paradise
          </div>
          <h1 className="nr-hero-title">
            <em>Tonight,</em>
            <br />
            on the sand.
          </h1>
          <p className="nr-hero-deck">
            Twelve nights of the season&apos;s most carefully curated coastal
            performances. Sunset to last light, one coastline, ten artists,
            one place.
          </p>

          <div className="nr-stat-strip" role="group" aria-label="Season at a glance">
            <div className="nr-stat">
              <span className="nr-stat-num">{stats.upcomingCount}</span>
              <span className="nr-stat-lbl">events</span>
            </div>
            <span className="nr-stat-rule" aria-hidden="true" />
            <div className="nr-stat">
              <span className="nr-stat-num">
                {stats.totalSold.toLocaleString("en-GB")}
              </span>
              <span className="nr-stat-lbl">sold</span>
            </div>
            <span className="nr-stat-rule" aria-hidden="true" />
            <div className="nr-stat">
              <span className="nr-stat-num">
                {stats.fillPct}
                <i>%</i>
              </span>
              <span className="nr-stat-lbl">filled</span>
            </div>
            <span className="nr-stat-rule" aria-hidden="true" />
            <div className="nr-stat">
              <span className="nr-stat-num">
                {formatCurrency(stats.totalRevenue)}
              </span>
              <span className="nr-stat-lbl">revenue</span>
            </div>
          </div>
        </div>

        {next && (
          <article className="nr-hero-card">
            <div className="nr-card-corner-glow" />
            <div className="nr-card-meta-line">
              <span className="nr-card-tag">NEXT</span>
              <span className="nr-card-date">
                {formatDate(next.event.date).toUpperCase()} ·{" "}
                {formatTime(next.event.startTime)}
              </span>
            </div>
            <h2 className="nr-card-title">{next.event.title}</h2>
            <p className="nr-card-headliner">
              with <strong>{next.headliner?.name ?? "TBA"}</strong>
            </p>
            <div className="nr-card-tags">
              {(next.event.tags ?? []).slice(0, 3).map((t) => (
                <span key={t} className="nr-tag">
                  {t}
                </span>
              ))}
            </div>

            <div className="nr-card-bar">
              <div className="nr-card-bar-track">
                <div
                  className="nr-card-bar-fill"
                  style={{ width: `${next.fillPct}%` }}
                />
              </div>
              <div className="nr-card-bar-meta">
                <span className="nr-bar-pct">
                  {next.fillPct}
                  <i>%</i>
                </span>
                <span className="nr-bar-remaining">
                  {next.remaining} left
                </span>
              </div>
            </div>

            <div className="nr-card-actions">
              <Link
                href={`/events/${next.event.id}`}
                className="nr-cta-primary"
              >
                Reserve from {formatCurrency(next.cheapestPrice)}
                <ArrowUpRight size={16} strokeWidth={2.2} />
              </Link>
              <Link
                href={`/events/${next.event.id}`}
                className="nr-cta-secondary"
              >
                Details
              </Link>
            </div>
          </article>
        )}
      </section>

      {/* GRID */}
      <section className="nr-section">
        <div className="nr-section-head">
          <div className="nr-kicker">
            <span /> the programme
          </div>
          <h3 className="nr-section-title">
            <em>Four nights</em> ahead.
          </h3>
        </div>
        <div className="nr-grid">
          {topGrid.map((e, i) => (
            <NoirCard key={e.event.id} e={e} index={i} />
          ))}
        </div>
      </section>

      {/* CHAT */}
      <section className="nr-chat">
        <div className="nr-chat-card">
          <div className="nr-chat-glow" />
          <div className="nr-chat-head">
            <div className="nr-chat-icon">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="nr-chat-eyebrow">PARADISE INTELLIGENCE</div>
              <h3 className="nr-chat-title">
                <em>Whisper</em> to Paradise.
              </h3>
            </div>
          </div>
          <p className="nr-chat-body">
            A concierge who knows every artist, every tier, every seat. Ask
            anything, in plain language. Get an answer that already knows
            what you need.
          </p>
          <div className="nr-chat-prompts">
            {[
              "Tonight's lineup",
              "VIPs left for the next event",
              "Reggae nights in July",
              "Tickets under €60",
            ].map((p) => (
              <button key={p} className="nr-chat-prompt">
                {p}
              </button>
            ))}
          </div>
          <Link href="/chat" className="nr-chat-cta">
            Open conversation
            <ArrowUpRight size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="nr-footer">
        <span>paradise · summer twenty-twenty-six</span>
        <span>— after dark —</span>
      </footer>
    </div>
  );
}

function NoirCard({ e, index }: { e: EnrichedEvent; index: number }) {
  const halos = ["#FF6B35", "#FF8FB1", "#FFC857", "#8B5CF6"];
  const halo = halos[index % halos.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="nr-card"
      style={{ ["--nr-card-halo" as never]: halo }}
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
        <div className="nr-card-halo-inner" />
        <div className="nr-card-meta-line">
          <span
            className="nr-card-tag"
            style={{
              color: halo,
              borderColor: `${halo}55`,
              background: `${halo}1A`,
            }}
          >
            {formatDate(e.event.date).toUpperCase()}
          </span>
          <span className="nr-card-time">
            {formatTime(e.event.startTime)}
          </span>
        </div>
        <h4 className="nr-card-h4">{e.event.title}</h4>
        <div className="nr-card-line">
          <span className="nr-card-headliner-line">
            {e.headliner?.name ?? "TBA"}
          </span>
          <span className="nr-card-venue-line">{e.event.venueSection}</span>
        </div>
        <div className="nr-card-bar">
          <div className="nr-card-bar-track">
            <div
              className="nr-card-bar-fill"
              style={{
                width: `${e.fillPct}%`,
                background: `linear-gradient(90deg, ${halo}, ${halo}A0)`,
              }}
            />
          </div>
          <div className="nr-card-bar-meta">
            <span className="nr-bar-pct">
              {e.fillPct}
              <i>%</i>
            </span>
            <span className="nr-bar-remaining">{e.remaining} left</span>
          </div>
        </div>
        <div className="nr-card-footer">
          <span className="nr-card-price">
            from {formatCurrency(e.cheapestPrice)}
          </span>
          <span className="nr-card-go" style={{ color: halo }}>
            reserve →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
