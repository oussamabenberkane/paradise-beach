"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useVelocity,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import { useCountUp } from "../_shared/hooks";
import { PalmsBack, PalmsMid, PalmsFront, PalmsHeader } from "./SunsetPalms";
import "./sunsetstrip.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Gated: flip to true after the palm scaffold is approved, then rebuild
   the cinematic timeline against the revised rest-frame composition
   (sun upper-right, diagonal arc, held peak, foreground push-in). */
const MOTION_PASS_READY = false;

const CARD_PHOTOS = [
  "/showcase/events/sunset-crowd.webp",
  "/showcase/events/golden-watchers.webp",
  "/showcase/events/stage-lights.webp",
];

export function SunsetStrip({ data }: { data: ShowcaseData }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  /* ─── GSAP cinematic timeline ─── */
  useEffect(() => {
    if (!MOTION_PASS_READY) return;
    if (!rootRef.current || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".ss-strip-stage",
          start: "top top",
          end: "+=150%",
          pin: ".ss-strip",
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      /* 0–10% scroll hint dissolves */
      tl.to(".ss-strip-cta", { opacity: 0, y: -8, ease: "none" }, 0);

      /* CONTINUOUS — sky color temperature shifts warm→cool via crossfade */
      tl.fromTo(
        ".ss-strip-sky-cool",
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 1 },
        0
      );

      /* CONTINUOUS — sun descends (eased so it lingers at horizon) */
      tl.fromTo(
        ".ss-strip-sun",
        { yPercent: 0 },
        { yPercent: 105, ease: "power2.inOut", duration: 1 },
        0
      );

      /* CONTINUOUS — night curtain descends from top, slower than sun */
      tl.fromTo(
        ".ss-strip-night",
        { yPercent: -100 },
        { yPercent: 0, ease: "power1.in", duration: 1 },
        0
      );

      /* 0–50% — palms rise into frame */
      tl.fromTo(
        ".ss-strip-palms",
        { yPercent: 8 },
        { yPercent: -10, ease: "power1.out", duration: 0.7 },
        0
      );

      /* 0–55% — haze drifts up + thins */
      tl.fromTo(
        ".ss-strip-haze",
        { yPercent: 0, opacity: 0.95 },
        { yPercent: -45, opacity: 0.45, ease: "power1.out", duration: 0.7 },
        0
      );

      /* 0–55% — sea drifts slightly upward (sun settles into water) */
      tl.fromTo(
        ".ss-strip-sea",
        { yPercent: 0 },
        { yPercent: -6, ease: "power1.out", duration: 0.7 },
        0
      );

      /* 0–60% — boardwalk + foreground sand slide DOWN and OUT */
      tl.fromTo(
        ".ss-strip-boardwalk",
        { yPercent: 0 },
        { yPercent: 140, ease: "power2.in", duration: 0.7 },
        0
      );

      /* 30–55% PEAK HOLD — flare blooms, saturation peaks, sun barely moves */
      tl.fromTo(
        ".ss-strip-flare",
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1.4, ease: "power2.out", duration: 0.2 },
        0.3
      );
      tl.to(
        ".ss-strip-flare",
        { opacity: 0, scale: 1.7, ease: "power2.in", duration: 0.15 },
        0.55
      );

      /* 55–80% — stars fade in upper register */
      tl.fromTo(
        ".ss-strip-stars",
        { opacity: 0 },
        { opacity: 1, ease: "power2.in", duration: 0.25 },
        0.55
      );

      /* 60–95% — neon signs flicker on, left to right */
      tl.fromTo(
        ".ss-neon-1",
        { opacity: 0 },
        { opacity: 1, ease: "steps(4)", duration: 0.08 },
        0.62
      );
      tl.fromTo(
        ".ss-neon-2",
        { opacity: 0 },
        { opacity: 1, ease: "steps(4)", duration: 0.08 },
        0.70
      );
      tl.fromTo(
        ".ss-neon-ask",
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, ease: "steps(5)", duration: 0.1 },
        0.78
      );
      tl.fromTo(
        ".ss-neon-3",
        { opacity: 0 },
        { opacity: 1, ease: "steps(4)", duration: 0.08 },
        0.86
      );

      /* 75–100% — dashboard glow reveals from below */
      tl.fromTo(
        ".ss-strip-handoff",
        { opacity: 0 },
        { opacity: 1, ease: "power2.out", duration: 0.25 },
        0.75
      );

      /* 80–100% — sticky nav slides down */
      tl.fromTo(
        ".ss-sticky-nav",
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, ease: "power2.out", duration: 0.2 },
        0.85
      );
    }, rootRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="ss-root" ref={rootRef}>
      {/* ────────────── STRIP STAGE (pinned cinematic) ────────────── */}
      <div className="ss-strip-stage">
        <div className="ss-strip">
          {/* SKY — warm layer (amber + rose) */}
          <div className="ss-strip-sky ss-strip-sky-warm" aria-hidden="true">
            <div className="ss-strip-sky-noise" />
          </div>
          {/* SKY — cool layer crossfades on top during descent */}
          <div className="ss-strip-sky ss-strip-sky-cool" aria-hidden="true" />

          {/* NIGHT CURTAIN (descends from top) */}
          <div className="ss-strip-night" aria-hidden="true">
            <StarsLayer />
          </div>

          {/* STARS (independent fade-in layer) */}
          <div className="ss-strip-stars" aria-hidden="true">
            <StarsLayer />
          </div>

          {/* SUN with halo */}
          <div className="ss-strip-sun-wrap" aria-hidden="true">
            <div className="ss-strip-sun">
              <svg viewBox="0 0 320 320">
                <defs>
                  <radialGradient id="ss-sun-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF6CC" />
                    <stop offset="40%" stopColor="#FFD23F" />
                    <stop offset="100%" stopColor="#FF8E3C" />
                  </radialGradient>
                  <radialGradient id="ss-sun-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFD23F" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="160" cy="160" r="158" fill="url(#ss-sun-halo)" className="ss-sun-pulse" />
                <circle cx="160" cy="160" r="92" fill="url(#ss-sun-core)" />
              </svg>
            </div>
          </div>

          {/* HORIZON FLARE (peak moment) */}
          <div className="ss-strip-flare" aria-hidden="true">
            <svg viewBox="0 0 1600 240" preserveAspectRatio="none">
              <defs>
                <radialGradient id="ss-flare-grad" cx="50%" cy="50%" r="40%">
                  <stop offset="0%" stopColor="#FFF1B8" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#FFD23F" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="800" cy="120" rx="600" ry="60" fill="url(#ss-flare-grad)" />
            </svg>
          </div>

          {/* SEA + HORIZON LINE */}
          <div className="ss-strip-sea" aria-hidden="true">
            <div className="ss-strip-sea-line" />
            <div className="ss-strip-sea-water" />
          </div>

          {/* PALMS — three depth planes, haze nests between back and mid */}
          <PalmsBack />
          <div className="ss-strip-haze" aria-hidden="true" />
          <PalmsMid />
          <PalmsFront />

          {/* DUST MOTES — ambient continuous (deterministic positions to avoid SSR mismatch) */}
          <div className="ss-strip-dust" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="ss-dust-mote"
                style={
                  {
                    "--mote-top": `${12 + ((i * 17) % 48)}%`,
                    "--mote-left": `${(i * 37) % 100}%`,
                    "--mote-delay": `${(i * 1.3) % 9}s`,
                    "--mote-dur": `${14 + (i % 5) * 3}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          {/* BOARDWALK / FOREGROUND */}
          <div className="ss-strip-boardwalk" aria-hidden="true">
            <div className="ss-strip-board-plank" />
            <div className="ss-strip-board-sand" />
          </div>

          {/* NEON SIGNS */}
          <div className="ss-strip-neon" aria-hidden="true">
            <span className="ss-neon-1 ss-neon-bulb" style={{ left: "14%", top: "62%" }} />
            <span className="ss-neon-2 ss-neon-bulb" style={{ left: "78%", top: "60%" }} />
            <span className="ss-neon-3 ss-neon-bulb" style={{ left: "44%", top: "65%" }} />
          </div>

          {/* "ASK THE STRIP" NEON SIGN (the chat affordance) */}
          <Link href="/chat" className="ss-neon-ask">
            <span className="ss-neon-ask-frame">
              <span className="ss-neon-ask-text">ASK THE STRIP</span>
              <span className="ss-neon-ask-sub">
                <Sparkles size={11} strokeWidth={2.4} />
                AI · always open
              </span>
            </span>
          </Link>

          {/* SCROLL CTA (initial state) */}
          <div className="ss-strip-cta" aria-hidden="true">
            <span className="ss-strip-cta-text">scroll to enter the strip</span>
            <ChevronDown size={18} strokeWidth={2.2} className="ss-strip-cta-chev" />
          </div>

          {/* DASHBOARD HANDOFF GLOW (bleed into strip during tail end) */}
          <div className="ss-strip-handoff" aria-hidden="true" />

          {/* REDUCED-MOTION STATIC FRAME */}
          <noscript />
        </div>
      </div>

      {/* ────────────── DASHBOARD (dark, lit by neon) ────────────── */}
      <DarkDashboard data={data} />
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*                  COMPONENTS                  */
/* ─────────────────────────────────────────── */

function StarsLayer() {
  // 36 small dots at random positions; CSS gives twinkle
  const stars = Array.from({ length: 36 }, (_, i) => ({
    cx: (i * 47.3) % 100,
    cy: (i * 31.7) % 60,
    r: 0.12 + ((i * 7) % 5) * 0.04,
    delay: ((i * 0.27) % 6).toFixed(2),
  }));
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="white"
          opacity={0.9}
          className="ss-star"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────── */
/*                 DASHBOARD                    */
/* ─────────────────────────────────────────── */

function DarkDashboard({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;

  return (
    <div className="ss-dashboard">
      {/* persistent palm silhouette header */}
      <div className="ss-palm-header" aria-hidden="true">
        <PalmsHeader />
      </div>

      {/* sticky dark nav (revealed at handoff) */}
      <header className="ss-sticky-nav">
        <div className="ss-sticky-brand">
          <span className="ss-sticky-sun" aria-hidden="true" />
          <span>paradise · summer &apos;26</span>
        </div>
        <nav className="ss-sticky-pills" aria-label="Festival sections">
          <a className="ss-sticky-pill is-active">Lineup</a>
          <a className="ss-sticky-pill">Stages</a>
          <a className="ss-sticky-pill">Tickets</a>
          <a className="ss-sticky-pill">Plan</a>
        </nav>
        <Link href="/chat" className="ss-sticky-cta">
          ASK THE STRIP
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </Link>
      </header>

      {/* HEADLINE BAND — replaces the strip's CTAs in document flow */}
      <section className="ss-band">
        <span className="ss-band-eyebrow">★ TWELVE NIGHTS · SUMMER &apos;26 ★</span>
        <h1 className="ss-band-title">
          The strip is open<br />
          <em>until last light.</em>
        </h1>
        {next && (
          <Link href={`/events/${next.event.id}`} className="ss-band-next">
            <span className="ss-band-next-tag">TONIGHT</span>
            <div className="ss-band-next-meta">
              <span className="ss-band-next-title">{next.event.title}</span>
              <span className="ss-band-next-sub">
                with {next.headliner?.name ?? "TBA"} · {next.event.venueSection}
              </span>
            </div>
            <span className="ss-band-next-cta">
              from {formatCurrency(next.cheapestPrice)} →
            </span>
          </Link>
        )}
      </section>

      {/* STATS */}
      <section className="ss-stats" aria-label="Season totals">
        <StatBlock label="NIGHTS" value={stats.upcomingCount} />
        <StatBlock label="TICKETS SOLD" value={stats.totalSold} />
        <StatBlock label="% FILLED" value={stats.fillPct} suffix="%" />
        <StatBlock
          label="REVENUE"
          value={Math.round(stats.totalRevenue / 1000)}
          suffix="K€"
        />
      </section>

      {/* LINEUP GRID */}
      <section className="ss-section">
        <div className="ss-section-head">
          <span className="ss-section-eyebrow">★ THE LINEUP ★</span>
          <h2 className="ss-section-title">
            Four nights to fall<br />
            in love with summer.
          </h2>
        </div>
        <div className="ss-grid">
          {topGrid.map((e, i) => (
            <SunsetCard key={e.event.id} e={e} index={i} />
          ))}
        </div>
      </section>

      {/* CHAT — "ASK THE STRIP" detailed panel */}
      <section className="ss-chat">
        <div className="ss-chat-box">
          <div className="ss-chat-neon-frame">
            <span className="ss-chat-neon-text">ASK THE STRIP</span>
            <span className="ss-chat-neon-sub">AI · always open</span>
          </div>
          <p className="ss-chat-body">
            The same concierge from the sign upstairs — only here you can see
            recent questions, suggested prompts, and the lineup at a glance.
          </p>
          <div className="ss-chat-prompts">
            {["What's playing tonight?", "Cheapest reggae night", "VIP nights in July"].map(
              (p) => (
                <button key={p} className="ss-chat-prompt">
                  {p}
                </button>
              )
            )}
          </div>
          <Link href="/chat" className="ss-chat-cta">
            Open the assistant
            <ArrowUpRight size={16} strokeWidth={2.4} />
          </Link>
        </div>
      </section>

      <VelocityMarquee />

      <footer className="ss-footer">
        <span>paradise · summer 2026</span>
        <span>★ open until last light ★</span>
      </footer>
    </div>
  );
}

function StatBlock({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const { ref, value: shown } = useCountUp(value, 700);
  return (
    <div className="ss-stat-block" ref={ref as React.RefObject<HTMLDivElement>}>
      <span className="ss-stat-num">
        {shown.toLocaleString("en-GB")}
        {suffix && <i>{suffix}</i>}
      </span>
      <span className="ss-stat-lbl">{label}</span>
    </div>
  );
}

function SunsetCard({ e, index }: { e: EnrichedEvent; index: number }) {
  const photo = CARD_PHOTOS[index % CARD_PHOTOS.length];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="ss-card"
    >
      <Link href={`/events/${e.event.id}`} className="ss-card-link">
        <div className="ss-card-top">
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="ss-card-img"
          />
          <div className="ss-card-top-scrim" />
          <span className="ss-card-num">
            N° {String(e.event.id).replace("e", "").padStart(2, "0")}
          </span>
          <span className="ss-card-date">{formatDate(e.event.date).toUpperCase()}</span>
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
          <div className="ss-card-bar">
            <div className="ss-card-bar-track">
              <div
                className="ss-card-bar-fill"
                style={{ width: `${e.fillPct}%` }}
              />
            </div>
            <div className="ss-card-bar-meta">
              <span className="ss-bar-pct">{e.fillPct}% sold</span>
              <span className="ss-bar-remain">{e.remaining} left</span>
            </div>
          </div>
          <div className="ss-card-foot">
            <span className="ss-card-price">
              from {formatCurrency(e.cheapestPrice)}
            </span>
            <span className="ss-card-go">Reserve →</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

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
    <div className="ss-marquee" aria-hidden="true">
      <div className="ss-marquee-track" ref={trackRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="ss-marquee-item">
            UNTIL LAST LIGHT
            <span className="ss-mq-star">★</span>
            PARADISE BEACH
            <span className="ss-mq-star">★</span>
            SUMMER &apos;26
            <span className="ss-mq-star">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
