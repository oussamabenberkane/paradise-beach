"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

/* ── Keyframe tables ── */
const STOPS         = [0,    0.45, 0.60, 1.00] as const;
const DAY_OPACITY   = [1,    1,    0,    0   ] as const;
const DAY_SCALE     = [1.0,  1.20, 1.25, 1.25] as const;
const DAY_BLUR      = [0,    0,    12,   12  ] as const;
const NIGHT_OPACITY = [0,    0,    1,    1   ] as const;
const NIGHT_SCALE   = [1.20, 1.20, 1.15, 1.0 ] as const;
const NIGHT_BLUR    = [12,   12,   6,    0   ] as const;
const WARM_ALPHA    = [0,    0.4,  0.2,  0   ] as const;
const COOL_ALPHA    = [0,    0.1,  0.4,  0.5 ] as const;
const DARK_ALPHA    = [0,    0,    0.2,  0.35] as const;
const CONTENT_OP    = [0,    0,    0,    1   ] as const;

/* cubic-bezier(0.4, 0, 0.2, 1) — Newton-Raphson invert x→t, sample y */
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
      const d  = dx(t);
      if (Math.abs(cx - x) < 1e-6) break;
      if (Math.abs(d)      < 1e-6) break;
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

export function CinematicSection() {
  const reduced    = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let rafId    = 0;
    let pending  = false;
    let isInView = true;

    const update = () => {
      pending = false;
      const rect           = section.getBoundingClientRect();
      const sectionH       = section.offsetHeight;
      const vh             = window.innerHeight;
      const scrollableRange = sectionH - vh;
      if (scrollableRange <= 0) return;
      const top = -rect.top;
      let p = top / scrollableRange;
      p = Math.max(0, Math.min(1, p));
      const e = ease(p);

      section.style.setProperty("--day-opacity",   String(lerpStops(DAY_OPACITY,   e)));
      section.style.setProperty("--day-scale",     String(lerpStops(DAY_SCALE,     e)));
      section.style.setProperty("--day-blur",      `${lerpStops(DAY_BLUR,   e).toFixed(2)}px`);
      section.style.setProperty("--night-opacity", String(lerpStops(NIGHT_OPACITY, e)));
      section.style.setProperty("--night-scale",   String(lerpStops(NIGHT_SCALE,   e)));
      section.style.setProperty("--night-blur",    `${lerpStops(NIGHT_BLUR, e).toFixed(2)}px`);
      section.style.setProperty("--warm-alpha",    String(lerpStops(WARM_ALPHA,    e)));
      section.style.setProperty("--cool-alpha",    String(lerpStops(COOL_ALPHA,    e)));
      section.style.setProperty("--dark-alpha",    String(lerpStops(DARK_ALPHA,    e)));
      section.style.setProperty("--content-op",    String(lerpStops(CONTENT_OP,    e)));
    };

    const onScroll = () => {
      if (pending || !isInView) return;
      pending = true;
      rafId = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        section.classList.toggle("is-active", isInView);
        if (isInView) update();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(section);

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
    <section
      id="pb-cinematic"
      ref={sectionRef}
      className={`pb-cinematic${reduced ? " is-reduced" : ""}`}
      aria-label="Cinematic beach transition"
    >
      <div className="pb-cinematic-sticky">
        {/* z-1: night photo — revealed as day fades */}
        <img
          className="pb-cin-night"
          src="/beach-assets/night-time.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
        {/* z-2: day photo — fades and scales out */}
        <img
          className="pb-cin-day"
          src="/beach-assets/day-time.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
        {/* z-3..5: colour overlays */}
        <div className="pb-cin-overlay pb-cin-warm" aria-hidden="true" />
        <div className="pb-cin-overlay pb-cin-cool" aria-hidden="true" />
        <div className="pb-cin-overlay pb-cin-dark" aria-hidden="true" />
        {/* z-6: content — fades in at p=60–100% */}
        <div className="pb-cin-content" aria-hidden={reduced ? undefined : "true"}>
          <p className="pb-cin-tagline">Where golden hour never ends.</p>
          <Link href="/chat" className="pb-cin-ask">
            <Sparkles size={14} strokeWidth={2.4} />
            Ask Paradise
          </Link>
        </div>
      </div>
    </section>
  );
}
