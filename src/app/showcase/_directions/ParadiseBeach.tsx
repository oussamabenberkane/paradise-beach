"use client";

import Link from "next/link";
import { Sparkles, ChevronDown } from "lucide-react";
import type { ShowcaseData } from "../_shared/data";
import { Calendar } from "./Calendar";
import { CinematicSection } from "./CinematicSection";
import "./paradise-beach.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ParadiseBeach({ data }: { data: ShowcaseData }) {
  function scrollToCalendar() {
    document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToCinematic() {
    document.getElementById("pb-cinematic")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="pb-root">
      {/* Hero — 100vh split layout. Left: text + CTAs. Right: breathing day frame. */}
      <section className="pb-hero" aria-label="Paradise Beach hero">
        <div className="pb-hero-sticky">
          {/* Left: typography-driven content */}
          <div className="pb-hero-left">
            <span className="pb-eyebrow">★ Summer &apos;26 · Twelve Nights ★</span>
            <h1 className="pb-headline">
              Paradise<br />
              <em>Beach.</em>
            </h1>
            <p className="pb-tagline">Where golden hour never ends.</p>
            <p className="pb-subtext">
              A beachfront venue for the ones who believe good music sounds
              better with sand between their toes. Twelve nights this summer,
              one stage, every kind of good time.
            </p>
            <div className="pb-ctas">
              <Link href="/tickets" className="pb-cta-primary">
                Reserve a Table
              </Link>
              <button onClick={scrollToCalendar} className="pb-cta-secondary">
                See This Week&apos;s Lineup
                <ChevronDown size={14} strokeWidth={2.5} />
              </button>
            </div>
            <button onClick={scrollToCinematic} className="pb-scroll-cue">
              Scroll to explore
              <ChevronDown size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right: framed day photo with ambient breathing */}
          <div className="pb-hero-right">
            <div className="pb-frame">
              <img
                className="pb-frame-day"
                src="/beach-assets/day-time.webp"
                alt="Sunlit paradise beach"
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic — 300vh, full-bleed day→night scroll animation */}
      <CinematicSection />

      {/* Calendar */}
      <Calendar />

      {/* Ask Paradise */}
      <AskParadise />

      {/* Marquee */}
      <div className="pb-marquee" aria-hidden="true">
        <div className="pb-marquee-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="pb-marquee-item">
              Until Last Light
              <span className="pb-mq-star">✦</span>
              Paradise Beach
              <span className="pb-mq-star">✦</span>
              Summer &apos;26
              <span className="pb-mq-star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-footer">
        <span>paradise · summer 2026</span>
        <span className="pb-footer-sun" aria-hidden="true" />
        <span>open until last light</span>
      </footer>
    </div>
  );
}

function AskParadise() {
  return (
    <section className="pb-ask">
      <div className="pb-ask-box">
        <h2 className="pb-ask-title">Ask Paradise</h2>
        <p className="pb-ask-body">
          Not sure where to start? Our AI concierge knows the full lineup,
          the best tables, and tonight&apos;s secret. Ask anything.
        </p>
        <div className="pb-ask-prompts">
          {[
            "What's on tonight?",
            "Best table for a group of 4",
            "Cheapest reggae night",
          ].map((p) => (
            <button key={p} className="pb-ask-prompt">
              {p}
            </button>
          ))}
        </div>
        <Link href="/chat" className="pb-ask-badge">
          <Sparkles size={14} strokeWidth={2.4} />
          Ask Paradise
        </Link>
      </div>
    </section>
  );
}
