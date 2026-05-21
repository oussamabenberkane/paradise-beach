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
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import { useCountUp } from "../_shared/hooks";
import "./sunsetstrip.css";
import "./sunsetstrip-v2.css";

const CARD_PHOTOS = [
  "/showcase/events/sunset-crowd.webp",
  "/showcase/events/golden-watchers.webp",
  "/showcase/events/stage-lights.webp",
];

/* ─────────────────────────────────────────────────────────────
   HERO — three-beat cinematic.
   Beat 1 (0–45%):  day zooms in from 1.0 to 1.20, sharp.
   Beat 2 (45–60%): soft crossfade — both images blurred, day fades
                    out as night fades in. Scales match at 45% so the
                    camera feels continuous, not two cuts.
   Beat 3 (60–100%): night zooms out 1.20 → 1.0, blur clears, content
                     fades in over the final 40%.
   ───────────────────────────────────────────────────────────── */
const STOPS         = [0,    0.45, 0.60, 1.00];
const DAY_OPACITY   = [1,    1,    0,    0];
const DAY_SCALE     = [1.0,  1.20, 1.25, 1.25];
const DAY_BLUR      = [0,    0,    12,   12];
const NIGHT_OPACITY = [0,    0,    1,    1];
const NIGHT_SCALE   = [1.20, 1.20, 1.15, 1.0];
const NIGHT_BLUR    = [12,   12,   6,    0];
const WARM_ALPHA    = [0,    0.4,  0.2,  0];
const COOL_ALPHA    = [0,    0.1,  0.4,  0.5];
const DARK_ALPHA    = [0,    0,    0.2,  0.35];
const CONTENT_OP    = [0,    0,    0,    1];

/* cubic-bezier(P1x, P1y, P2x, P2y) — Newton-Raphson invert x→t, sample y. */
function makeBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const sx = (t: number) =>
    3 * (1 - t) * (1 - t) * t * p1x + 3 * (1 - t) * t * t * p2x + t * t * t;
  const sy = (t: number) =>
    3 * (1 - t) * (1 - t) * t * p1y + 3 * (1 - t) * t * t * p2y + t * t * t;
  const dx = (t: number) =>
    3 * (1 - t) * (1 - t) * p1x +
    6 * (1 - t) * t * (p2x - p1x) +
    3 * t * t * (1 - p2x);
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const cx = sx(t);
      const d = dx(t);
      if (Math.abs(cx - x) < 1e-6) break;
      if (Math.abs(d) < 1e-6) break;
      t -= (cx - x) / d;
    }
    return sy(Math.max(0, Math.min(1, t)));
  };
}
const ease = makeBezier(0.4, 0, 0.2, 1);

function lerpStops(values: readonly number[], t: number): number {
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (t <= STOPS[i + 1]) {
      const span = STOPS[i + 1] - STOPS[i];
      if (span === 0) return values[i];
      const local = (t - STOPS[i]) / span;
      return values[i] + (values[i + 1] - values[i]) * local;
    }
  }
  return values[values.length - 1];
}

export function SunsetStripV2({ data }: { data: ShowcaseData }) {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    const hero = heroRef.current;
    if (!hero) return;

    let rafId = 0;
    let pending = false;
    let isInView = true;

    const update = () => {
      pending = false;
      const rect = hero.getBoundingClientRect();
      const heroH = hero.offsetHeight;
      const vh = window.innerHeight;
      const scrollableRange = heroH - vh;
      if (scrollableRange <= 0) return;
      const heroTop = -rect.top;
      let p = heroTop / scrollableRange;
      p = Math.max(0, Math.min(1, p));
      const e = ease(p);

      hero.style.setProperty("--day-opacity",   String(lerpStops(DAY_OPACITY,   e)));
      hero.style.setProperty("--day-scale",     String(lerpStops(DAY_SCALE,     e)));
      hero.style.setProperty("--day-blur",      `${lerpStops(DAY_BLUR,   e).toFixed(2)}px`);
      hero.style.setProperty("--night-opacity", String(lerpStops(NIGHT_OPACITY, e)));
      hero.style.setProperty("--night-scale",   String(lerpStops(NIGHT_SCALE,   e)));
      hero.style.setProperty("--night-blur",    `${lerpStops(NIGHT_BLUR, e).toFixed(2)}px`);
      hero.style.setProperty("--warm-alpha",    String(lerpStops(WARM_ALPHA,    e)));
      hero.style.setProperty("--cool-alpha",    String(lerpStops(COOL_ALPHA,    e)));
      hero.style.setProperty("--dark-alpha",    String(lerpStops(DARK_ALPHA,    e)));
      hero.style.setProperty("--content-op",    String(lerpStops(CONTENT_OP,    e)));
    };

    const onScroll = () => {
      if (pending || !isInView) return;
      pending = true;
      rafId = requestAnimationFrame(update);
    };

    /* Toggle will-change only while hero is near the viewport */
    const io = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        hero.classList.toggle("is-active", isInView);
        if (isInView) update();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(hero);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  return (
    <div className="ss-root">
      {/* Hero — single 300vh section, single 100vh sticky inside.
          Sticky is a direct child of the section so the section IS its
          containing block for pin bounds. Pin runs from X=0 to X=200vh
          (300vh container minus 100vh sticky), giving 200vh of scroll
          runway pinned to the viewport. */}
      <section
        ref={heroRef}
        className={`ssv2-hero ${reduced ? "is-reduced" : ""}`}
        aria-label="Paradise Beach hero"
      >
        <div className="ssv2-sticky">
          {/* z-1: night photo */}
          <img
            className="ssv2-night"
            src="/beach-assets/night-time.webp"
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
          {/* z-2: day photo */}
          <img
            className="ssv2-day"
            src="/beach-assets/day-time.webp"
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
          {/* z-3..5: overlays */}
          <div className="ssv2-overlay ssv2-warm" aria-hidden="true" />
          <div className="ssv2-overlay ssv2-cool" aria-hidden="true" />
          <div className="ssv2-overlay ssv2-dark" aria-hidden="true" />

          {/* z-6: content (matches dashboard tokens) */}
          <div className="ssv2-content">
            <span className="ssv2-eyebrow">
              ★ SUMMER &apos;26 · TWELVE NIGHTS ★
            </span>
            <h1 className="ssv2-title">
              Paradise <em>Beach.</em>
            </h1>
            <p className="ssv2-deck">The strip is open until last light.</p>
            <Link href="/chat" className="ssv2-cta">
              <span className="ssv2-cta-frame">
                <span className="ssv2-cta-text">ASK THE STRIP</span>
                <span className="ssv2-cta-sub">
                  <Sparkles size={11} strokeWidth={2.4} />
                  AI · always open
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard — unchanged */}
      <DarkDashboard data={data} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD — same JSX, same tokens, same .ss-* class names
   ───────────────────────────────────────────────────────────── */

function DarkDashboard({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;

  return (
    <div className="ss-dashboard">
      <div className="ss-palm-header" aria-hidden="true">
        <div className="ss-palms ss-palms-header" />
      </div>

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
              ),
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
    <div
      className="ss-stat-block"
      ref={ref as React.RefObject<HTMLDivElement>}
    >
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
          <span className="ss-card-date">
            {formatDate(e.event.date).toUpperCase()}
          </span>
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
