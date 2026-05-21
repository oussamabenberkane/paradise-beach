"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Editorial } from "./_directions/Editorial";
import { Noir } from "./_directions/Noir";
import { Poster } from "./_directions/Poster";
import type { ShowcaseData } from "./_shared/data";
import "./showcase.css";

type Direction = "editorial" | "noir" | "poster";

const DIRECTIONS: {
  key: Direction;
  label: string;
  tag: string;
  kbd: string;
  swatch: [string, string];
}[] = [
  {
    key: "editorial",
    label: "Editorial Sunset",
    tag: "A",
    kbd: "1",
    swatch: ["#FAF4EA", "#C2410C"],
  },
  {
    key: "noir",
    label: "Riviera Noir",
    tag: "B",
    kbd: "2",
    swatch: ["#07101F", "#FF6B35"],
  },
  {
    key: "poster",
    label: "Festival Poster",
    tag: "C",
    kbd: "3",
    swatch: ["#FF4D2E", "#FFB627"],
  },
];

export function ShowcaseShell({ data }: { data: ShowcaseData }) {
  const [active, setActive] = useState<Direction>("editorial");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1") setActive("editorial");
      else if (e.key === "2") setActive("noir");
      else if (e.key === "3") setActive("poster");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="showcase-root">
      <div className="showcase-toggle">
        <div className="showcase-toggle-inner">
          <span className="showcase-brand">paradise · design exploration</span>
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
          {active === "editorial" && <Editorial data={data} />}
          {active === "noir" && <Noir data={data} />}
          {active === "poster" && <Poster data={data} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
