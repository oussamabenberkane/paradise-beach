"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SunsetStrip } from "./_directions/SunsetStrip";
import { Poster } from "./_directions/Poster";
import { SmoothScroll } from "./_shared/SmoothScroll";
import type { ShowcaseData } from "./_shared/data";
import "./showcase.css";

type Direction = "sunset" | "poster";

const DIRECTIONS: {
  key: Direction;
  label: string;
  tag: string;
  kbd: string;
  motion: string;
  swatch: [string, string];
}[] = [
  {
    key: "sunset",
    label: "Sunset Strip",
    tag: "A",
    kbd: "1",
    motion: "Atmosphere parallax",
    swatch: ["#FFB87A", "#C94B7C"],
  },
  {
    key: "poster",
    label: "Festival Poster",
    tag: "B",
    kbd: "2",
    motion: "Scroll-linked",
    swatch: ["#FF4D2E", "#FFB627"],
  },
];

export function ShowcaseShell({ data }: { data: ShowcaseData }) {
  const [active, setActive] = useState<Direction>("sunset");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "1") setActive("sunset");
      else if (e.key === "2") setActive("poster");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [active]);

  const activeMotion = DIRECTIONS.find((d) => d.key === active)?.motion;

  return (
    <SmoothScroll>
    <div className="showcase-root">
      <div className="showcase-toggle">
        <div className="showcase-toggle-inner">
          <span className="showcase-brand">
            paradise · design exploration
            {activeMotion && (
              <span className="showcase-motion-tag" aria-live="polite">
                · {activeMotion}
              </span>
            )}
          </span>
          <div
            className="showcase-toggle-pills"
            role="tablist"
            aria-label="Design directions"
          >
            {DIRECTIONS.map((d) => (
              <button
                key={d.key}
                role="tab"
                aria-selected={active === d.key}
                aria-controls={`showcase-panel-${d.key}`}
                onClick={() => setActive(d.key)}
                className={`showcase-pill ${active === d.key ? "is-active" : ""}`}
              >
                <span
                  className="showcase-pill-swatch"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, ${d.swatch[0]} 0%, ${d.swatch[0]} 48%, ${d.swatch[1]} 52%, ${d.swatch[1]} 100%)`,
                  }}
                />
                <span className="showcase-pill-tag">{d.tag}</span>
                <span className="showcase-pill-label">{d.label}</span>
                <kbd className="showcase-pill-kbd">{d.kbd}</kbd>
              </button>
            ))}
          </div>
          <a href="/" className="showcase-back">
            ← back to app
          </a>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          id={`showcase-panel-${active}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="showcase-stage"
        >
          {active === "sunset" && <SunsetStrip data={data} />}
          {active === "poster" && <Poster data={data} />}
        </motion.div>
      </AnimatePresence>
    </div>
    </SmoothScroll>
  );
}
