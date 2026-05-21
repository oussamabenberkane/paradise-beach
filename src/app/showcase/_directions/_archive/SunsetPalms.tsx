"use client";

import React from "react";

/* Palm silhouettes — sourced from OpenClipart, all verified CC0 (public domain).
   See /public/showcase/palms/CREDITS.md for individual file attributions.

   Rendered via CSS mask-image so a single source SVG can be recolored per
   depth plane (back: lifted aubergine, front: full #160B1F). */

type PalmFile = "280838" | "292732" | "174788";

/* Native viewBox aspect ratios (width / height) for each palm asset.
   Slot aspect-ratio matches its palm so contain-fit doesn't distort. */
const ASPECTS: Record<PalmFile, string> = {
  "280838": "752 / 1646", // 0.46 — tall narrow coconut palm
  "292732": "374 / 438",  // 0.85 — near-square stout palm
  "174788": "636 / 1608", // 0.40 — very tall washingtonia
};

type SlotProps = {
  file: PalmFile;
  left?: string;
  right?: string;
  flip?: boolean;
};

function PalmSlot({ file, left, right, flip = false }: SlotProps) {
  return (
    <div
      className="ss-palm-slot"
      style={
        {
          left,
          right,
          aspectRatio: ASPECTS[file],
          transform: flip ? "scaleX(-1)" : undefined,
          "--palm-src": `url(/showcase/palms/palm-${file}.svg)`,
        } as React.CSSProperties
      }
    >
      <div className="ss-palm-mask" />
    </div>
  );
}

/* Back plane — a wide row of distant palms (single scene mask, plane is the mask host) */
export function PalmsBack() {
  return <div className="ss-palms ss-palms-back" aria-hidden="true" />;
}

/* Mid plane — 4 medium palms, all three silhouettes used for variety */
export function PalmsMid() {
  return (
    <div className="ss-palms ss-palms-mid" aria-hidden="true">
      <PalmSlot file="280838" left="14%" />
      <PalmSlot file="292732" left="36%" />
      <PalmSlot file="174788" left="56%" flip />
      <PalmSlot file="280838" left="78%" flip />
    </div>
  );
}

/* Front plane — 2 large palms anchored to the edges, bled off-screen */
export function PalmsFront() {
  return (
    <div className="ss-palms ss-palms-front" aria-hidden="true">
      <PalmSlot file="280838" left="-6%" />
      <PalmSlot file="174788" right="-4%" flip />
    </div>
  );
}

/* Dashboard header — same wide back-scene, smaller */
export function PalmsHeader() {
  return <div className="ss-palms ss-palms-header" aria-hidden="true" />;
}
