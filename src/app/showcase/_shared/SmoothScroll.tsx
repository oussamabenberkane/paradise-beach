"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginRegistered = false;
function registerPluginOnce() {
  if (pluginRegistered) return;
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  pluginRegistered = true;
}

/**
 * Wraps showcase content with Lenis smooth scroll + GSAP ScrollTrigger sync.
 * - Disabled when prefers-reduced-motion is set
 * - Disabled on touch devices (native scroll feels better)
 * - Single ticker — Lenis drives GSAP, GSAP drives ScrollTrigger
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    registerPluginOnce();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;
    if (reduced || isCoarsePointer) {
      // Still tell GSAP to refresh on resize for any non-scrubbed triggers
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("resize", refresh);
      return () => window.removeEventListener("resize", refresh);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Ensure ScrollTrigger picks up Lenis's scroll position
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
