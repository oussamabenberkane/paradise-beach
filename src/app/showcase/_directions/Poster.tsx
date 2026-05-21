"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import "./poster.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const POSTER_PALETTES = [
  { key: "coral",    bg: "#FF4D2E", paper: "#FFE5D1", ink: "#2A0F08", accent: "#FFB627" },
  { key: "marigold", bg: "#FFB627", paper: "#FFF5E1", ink: "#3D2400", accent: "#FF4D2E" },
  { key: "teal",     bg: "#0B6E6E", paper: "#E1F2F2", ink: "#04201F", accent: "#FFB627" },
  { key: "plum",     bg: "#5C2A4E", paper: "#F5E8F0", ink: "#1F0F1A", accent: "#FFB627" },
];

const VIEW_ONCE = { once: true, margin: "-80px" } as const;

export function Poster({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // GSAP pinned hero with scrubbed ticket-peel + sun horizon drop
  useEffect(() => {
    if (!heroRef.current || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=75%",
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      // sun descends with rotation
      tl.to(".ps-hero-sun", { y: 360, rotate: 22, opacity: 0.45, ease: "none" }, 0)
        // primary ticket lifts and tilts deeper
        .to(".ps-ticket-pin", {
          y: -24,
          rotate: -3,
          rotationX: -14,
          transformPerspective: 900,
          transformOrigin: "left center",
          ease: "none",
        }, 0)
        // hero title drifts up + fades
        .to(".ps-hero-title", { y: -90, opacity: 0.55, ease: "none" }, 0)
        // deck text drifts up
        .to(".ps-hero-deck", { y: -50, opacity: 0.55, ease: "none" }, 0);
    }, heroRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="ps-root">
      <div className="ps-grain" aria-hidden="true" />

      {/* TOP MARQUEE — velocity reactor */}
      <VelocityMarquee />

      {/* HERO with pinned sun drop + ticket peel */}
      <section className="ps-hero" ref={heroRef}>
        {/* sun behind the hero */}
        <div className="ps-hero-sun" aria-hidden="true">
          <svg viewBox="0 0 240 240">
            <defs>
              <radialGradient id="ps-sun-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE26A" />
                <stop offset="55%" stopColor="#FFB627" />
                <stop offset="100%" stopColor="#FF4D2E" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="100" fill="url(#ps-sun-grad)" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 120 + Math.cos(angle) * 110;
              const y1 = 120 + Math.sin(angle) * 110;
              const x2 = 120 + Math.cos(angle) * 130;
              const y2 = 120 + Math.sin(angle) * 130;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FFB627"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>

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
                <div className="ps-ticket-pin">
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
                </div>
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

      {/* WAVE DIVIDER — scrubbed draw */}
      <WaveDivider />

      {/* STATS with color-sweep wipe */}
      <SweptStats stats={stats} reduced={reduced ?? false} />

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

      {/* CHAT — atmospheric stage photo backdrop */}
      <section className="ps-chat">
        <div className="ps-chat-box">
          <div className="ps-chat-photo" aria-hidden="true">
            <img
              src="/showcase/events/stage-lights.webp"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="ps-chat-photo-scrim" />
          </div>
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

/* ─────────────────────────────────────────── */

function WaveDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // scrubbed draw — pathLength tracks scroll position through this section
  const draw1 = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);
  const draw2 = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);

  return (
    <div className="ps-wave-divider" aria-hidden="true" ref={ref}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
        <motion.path
          d="M0 30 Q150 5 300 30 T600 30 T900 30 T1200 30"
          fill="none"
          stroke="#FFB627"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ pathLength: draw1 }}
        />
        <motion.path
          d="M0 45 Q150 20 300 45 T600 45 T900 45 T1200 45"
          fill="none"
          stroke="#FF4D2E"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: draw2 }}
        />
      </svg>
    </div>
  );
}

function SweptStats({
  stats,
  reduced,
}: {
  stats: ShowcaseData["stats"];
  reduced: boolean;
}) {
  return (
    <motion.section
      className="ps-stats"
      aria-label="Season at a glance"
      initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={VIEW_ONCE}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ps-stat-block">
        <span className="ps-stat-num">{stats.upcomingCount}</span>
        <span className="ps-stat-lbl">NIGHTS</span>
      </div>
      <div className="ps-stat-block">
        <span className="ps-stat-num">{stats.totalSold.toLocaleString("en-GB")}</span>
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
    </motion.section>
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
      viewport={VIEW_ONCE}
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

/**
 * Top marquee whose speed reacts to scroll velocity.
 * Uses Framer Motion's useVelocity on window.scrollY (which Lenis modifies).
 */
function VelocityMarquee() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const trackRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(smooth, "change", (v) => {
    if (!trackRef.current || reduced) return;
    const speedFactor = Math.min(2.5, 1 + Math.abs(v) / 1200);
    const duration = Math.max(14, 38 / speedFactor);
    trackRef.current.style.animationDuration = `${duration}s`;
  });

  return (
    <div className="ps-marquee" aria-hidden="true">
      <div className="ps-marquee-track" ref={trackRef}>
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
  );
}
