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
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ShowcaseData, EnrichedEvent } from "../_shared/data";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import { useCountUp } from "../_shared/hooks";
import "./sunsetstrip.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Event-card photos (Unsplash credits: Steven Weeks, Jamaal Cooks, Spencer Imbrock)
const CARD_PHOTOS = [
  "/showcase/events/sunset-crowd.webp",
  "/showcase/events/golden-watchers.webp",
  "/showcase/events/stage-lights.webp",
];

export function SunsetStrip({ data }: { data: ShowcaseData }) {
  const { next, topGrid, stats } = data;
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // GSAP pinned hero with scrubbed multi-layer parallax timeline
  useEffect(() => {
    if (!heroRef.current) return;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=85%",
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // back layer (sky) — slow upward drift + slight zoom
      tl.to(".ss-layer-sky", { yPercent: -8, scale: 1.08, ease: "none" }, 0)
        // sun arcs down behind the horizon
        .to(".ss-hero-sun", { y: 320, scale: 0.78, ease: "none" }, 0)
        // foreground palms move faster (closer)
        .to(".ss-layer-palms", { yPercent: 14, ease: "none" }, 0)
        // hero content drifts up + fades
        .to(".ss-hero-content", { y: -160, opacity: 0, ease: "none" }, 0);
    }, heroRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="ss-root">
      {/* Fallback drifting gradient sky behind everything (fixed) */}
      <div className="ss-sky-gradient" aria-hidden="true" />

      {/* TOP */}
      <header className="ss-top">
        <div className="ss-top-brand">
          <span className="ss-brand-sun" aria-hidden="true" />
          <span>paradise · summer &apos;26</span>
        </div>
        <nav className="ss-top-nav" aria-label="Festival sections">
          <a className="ss-top-link is-active">Lineup</a>
          <a className="ss-top-link">Stages</a>
          <a className="ss-top-link">Tickets</a>
          <a className="ss-top-link">Plan</a>
        </nav>
        <Link href="/chat" className="ss-top-cta">
          Plan your night
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </Link>
      </header>

      {/* HERO — pinned by GSAP, layered photo parallax */}
      <section className="ss-hero" ref={heroRef}>
        {/* back layer — sky photo (Photo: Philipp / Unsplash) */}
        <div className="ss-layer ss-layer-sky" aria-hidden="true">
          <img
            src="/showcase/hero/sky.webp"
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="ss-layer-sky-scrim" />
        </div>

        {/* mid: SVG sun with glow */}
        <div className="ss-hero-sun" aria-hidden="true">
          <svg viewBox="0 0 240 240">
            <defs>
              <radialGradient id="ss-sun-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF1B8" />
                <stop offset="55%" stopColor="#FFD23F" />
                <stop offset="100%" stopColor="#FF6B6B" />
              </radialGradient>
              <radialGradient id="ss-sun-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFD23F" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="118" fill="url(#ss-sun-halo)" />
            <circle cx="120" cy="120" r="86" fill="url(#ss-sun-grad)" />
          </svg>
        </div>

        {/* front layer — palm silhouette photo (Photo: Zoshua Colah / Unsplash) */}
        <div className="ss-layer ss-layer-palms" aria-hidden="true">
          <img
            src="/showcase/hero/palm.webp"
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="ss-hero-content">
          <span className="ss-hero-badge">★ TWELVE NIGHTS · SUMMER &apos;26 ★</span>
          <h1 className="ss-hero-title">
            <span className="ss-title-line">ENDLESS</span>
            <span className="ss-title-line ss-title-line-2">SUMMER.</span>
          </h1>
          <p className="ss-hero-deck">
            Twelve nights of sun, sand, and the most carefully curated coastal
            lineup of the year. Doors at sunset. Music until last light.
          </p>
          {next && (
            <Link href={`/events/${next.event.id}`} className="ss-hero-next">
              <span className="ss-next-tag">TONIGHT</span>
              <div className="ss-next-meta">
                <span className="ss-next-title">{next.event.title}</span>
                <span className="ss-next-sub">
                  with {next.headliner?.name ?? "TBA"} · {next.event.venueSection}
                </span>
              </div>
              <span className="ss-next-cta">
                from {formatCurrency(next.cheapestPrice)} →
              </span>
            </Link>
          )}
        </div>

        {/* scroll hint at bottom */}
        <div className="ss-scroll-hint" aria-hidden="true">
          <span>scroll</span>
          <span className="ss-scroll-hint-line" />
        </div>
      </section>

      {/* STAT STRIP */}
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

      {/* CHAT — water-photo backdrop (Photo: Bernd Dittrich / Unsplash) */}
      <section className="ss-chat">
        <div className="ss-chat-box">
          <div className="ss-chat-photo" aria-hidden="true">
            <img
              src="/showcase/hero/water.webp"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="ss-chat-photo-scrim" />
          </div>
          <div className="ss-chat-row">
            <div className="ss-chat-icon" aria-hidden="true">
              <Sparkles size={20} strokeWidth={2.4} />
            </div>
            <div className="ss-chat-head">
              <span className="ss-chat-eyebrow">PARADISE ASSISTANT</span>
              <h3 className="ss-chat-title">Talk to the lineup.</h3>
            </div>
          </div>
          <p className="ss-chat-body">
            Tell us the kind of night you want. We&apos;ll tell you where it
            lives — every artist, every tier, every seat.
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

      {/* MARQUEE — velocity reactor */}
      <VelocityMarquee />

      <footer className="ss-footer">
        <span>paradise · summer 2026</span>
        <span>★ keep it bright ★</span>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────── */

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

/**
 * Marquee whose speed reacts to scroll velocity. Works under Lenis since Lenis
 * modifies window.scrollY which useVelocity consumes.
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
    <div className="ss-marquee" aria-hidden="true">
      <div className="ss-marquee-track" ref={trackRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="ss-marquee-item">
            ENDLESS SUMMER
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
