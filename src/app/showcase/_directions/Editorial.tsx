"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import "./editorial.css";

export function Editorial({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;

  return (
    <div className="ed-root">
      {/* MASTHEAD */}
      <header className="ed-masthead">
        <div className="ed-mast-tag">A Seasonal Dispatch</div>
        <div>
          <div className="ed-mast-title">
            Paradise <em>Beach</em>
          </div>
          <div className="ed-mast-sub">
            Issue Nº 06 · Summer Twenty-Twenty-Six
          </div>
        </div>
        <div className="ed-mast-page">p. 01 — programme</div>
      </header>
      <div className="ed-hairline" />

      {/* HERO */}
      <section className="ed-hero">
        <div className="ed-hero-kicker">↳ This week at Paradise</div>
        <h1 className="ed-hero-title">
          The summer<br />
          arrives<em>, gently,</em><br />
          from the south.
        </h1>
        <div className="ed-hero-deck">
          Twelve nights. Ten artists. One coastline. A field guide to the
          season&apos;s most carefully curated sand-side performances.
        </div>
      </section>
      <div className="ed-hairline" />

      {/* LEAD */}
      {next && (
        <>
          <section className="ed-lead">
            <div className="ed-lead-left">
              <div className="ed-kicker">↳ The Next Night</div>
              <h2 className="ed-lead-h2">{next.event.title}</h2>
              <p className="ed-lead-byline">
                With <strong>{next.headliner?.name ?? "TBA"}</strong>
                {next.supports.length > 0 && (
                  <>
                    {" "}and {next.supports.map((s) => s.name).join(", ")}
                  </>
                )}
                . A {(next.event.tags ?? []).slice(0, 2).join(" · ") || "summer"}{" "}
                evening at {next.event.venueSection}.
              </p>
              <p className="ed-lead-body">
                <span className="ed-drop">{next.event.description.charAt(0)}</span>
                {next.event.description.slice(1)}
              </p>
              <div className="ed-lead-meta">
                <div>
                  <span className="ed-meta-label">Date</span>
                  <span className="ed-meta-value">
                    {formatDate(next.event.date)}
                  </span>
                </div>
                <div>
                  <span className="ed-meta-label">Doors</span>
                  <span className="ed-meta-value">
                    {formatTime(next.event.startTime)}
                  </span>
                </div>
                <div>
                  <span className="ed-meta-label">From</span>
                  <span className="ed-meta-value">
                    {formatCurrency(next.cheapestPrice)}
                  </span>
                </div>
                <div>
                  <span className="ed-meta-label">Seats left</span>
                  <span className="ed-meta-value">{next.remaining}</span>
                </div>
              </div>
              <Link href={`/events/${next.event.id}`} className="ed-lead-cta">
                Read &amp; reserve
                <ArrowUpRight size={16} strokeWidth={2} />
              </Link>
            </div>

            <div className="ed-lead-right">
              <figure className="ed-figure">
                <div
                  className="ed-figure-image"
                  style={{
                    background: `linear-gradient(135deg, #E8580C 0%, #9C330A 100%)`,
                  }}
                >
                  <div className="ed-figure-overlay" />
                  <span className="ed-figure-watermark">
                    Nº{" "}
                    {String(next.event.id).replace("e", "").padStart(2, "0")}
                  </span>
                </div>
                <figcaption className="ed-figure-caption">
                  Photograph from the <em>{next.event.venueSection}</em>, last
                  season.
                  <span>— Paradise Archives</span>
                </figcaption>
              </figure>
            </div>
          </section>
          <div className="ed-hairline" />
        </>
      )}

      {/* STATS */}
      <section className="ed-stats">
        <span className="ed-stat">
          <em>{stats.upcomingCount}</em> nights
        </span>
        <span className="ed-stat-sep">·</span>
        <span className="ed-stat">
          <em>{stats.totalSold.toLocaleString("en-GB")}</em> tickets sold
        </span>
        <span className="ed-stat-sep">·</span>
        <span className="ed-stat">
          <em>{stats.fillPct}%</em> of seats filled
        </span>
        <span className="ed-stat-sep">·</span>
        <span className="ed-stat">
          <em>{formatCurrency(stats.totalRevenue)}</em> in revenue
        </span>
      </section>
      <div className="ed-hairline" />

      {/* GRID */}
      <section className="ed-grid-section">
        <div className="ed-section-head">
          <div className="ed-kicker">↳ The Programme</div>
          <h3 className="ed-section-title">
            The summer in <em>chronological</em> order.
          </h3>
        </div>
        <div className="ed-grid">
          {topGrid.map((e, i) => (
            <EditorialCard key={e.event.id} e={e} index={i} />
          ))}
        </div>
      </section>
      <div className="ed-hairline" />

      {/* LETTER (chat) */}
      <section className="ed-letter">
        <div className="ed-letter-kicker">↳ A Conversation</div>
        <h3 className="ed-letter-title">
          Ask the <em>concierge</em>.
        </h3>
        <p className="ed-letter-body">
          Paradise is small enough that we know every artist, every tier,
          every seat. Tell us what you&apos;re looking for, and we&apos;ll
          tell you where to find it.
        </p>
        <div className="ed-letter-prompts">
          <button className="ed-prompt">Who is playing this weekend?</button>
          <button className="ed-prompt">Reggae nights in July.</button>
          <button className="ed-prompt">VIPs left for the next event?</button>
        </div>
        <Link href="/chat" className="ed-letter-cta">
          Start a conversation
          <ArrowUpRight size={16} strokeWidth={2} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="ed-footer">
        <span>Paradise Beach, Summer 2026.</span>
        <span>— End of Issue Nº 06 —</span>
      </footer>
    </div>
  );
}

function EditorialCard({ e, index }: { e: EnrichedEvent; index: number }) {
  const palettes = [
    ["#E8580C", "#9C330A"],
    ["#C2410C", "#7C2D12"],
    ["#D97706", "#92400E"],
    ["#B45309", "#451A03"],
  ];
  const [a, b] = palettes[index % palettes.length];

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
      className="ed-card"
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
        <div
          className="ed-card-img"
          style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
        >
          <div className="ed-card-img-overlay" />
          <span className="ed-card-num">
            Nº {String(e.event.id).replace("e", "").padStart(2, "0")}
          </span>
          <span className="ed-card-date-corner">
            {formatDate(e.event.date)}
          </span>
        </div>
        <div className="ed-card-body">
          <h4 className="ed-card-title">{e.event.title}</h4>
          <p className="ed-card-meta">
            With <strong>{e.headliner?.name ?? "TBA"}</strong> at{" "}
            {e.event.venueSection}
          </p>
          <div className="ed-card-footer">
            <span className="ed-card-price">
              From {formatCurrency(e.cheapestPrice)}
            </span>
            <span className="ed-card-arrow">Read →</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
