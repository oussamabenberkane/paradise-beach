"use client";

import React from "react";

/* Six hand-tuned palm specs. Each renders inside a 200x400 viewBox
   with the base at (100, 400). Frond geometry is generated procedurally
   from the spec so jitter stays deterministic across SSR. */

type PalmSpec = {
  height: number;       // trunk length within the 0-400 viewBox
  leanDeg: number;      // overall trunk lean, -10 to +10
  trunkCurveX: number;  // S-curve intensity, -12 to +12
  trunkWidth: number;   // 4 to 8
  fronds: 6 | 7 | 8 | 9;
  frondLength: number;  // 50 to 95
  seed: number;         // deterministic per-frond jitter
};

const PALMS: PalmSpec[] = [
  { height: 320, leanDeg: -4, trunkCurveX:  10, trunkWidth: 6.5, fronds: 8, frondLength: 78, seed: 13 },
  { height: 260, leanDeg:  3, trunkCurveX:  -8, trunkWidth: 5.5, fronds: 7, frondLength: 66, seed: 29 },
  { height: 300, leanDeg: -2, trunkCurveX:   5, trunkWidth: 6.0, fronds: 9, frondLength: 82, seed:  7 },
  { height: 340, leanDeg:  5, trunkCurveX: -12, trunkWidth: 7.0, fronds: 8, frondLength: 88, seed: 41 },
  { height: 230, leanDeg: -7, trunkCurveX:   7, trunkWidth: 5.0, fronds: 6, frondLength: 60, seed: 19 },
  { height: 285, leanDeg:  2, trunkCurveX:  -5, trunkWidth: 6.0, fronds: 8, frondLength: 72, seed: 53 },
];

function frondPath(
  angleDeg: number,
  length: number,
  cx: number,
  cy: number,
  sag: number,
): string {
  const a = (angleDeg * Math.PI) / 180;
  const tipX = cx + Math.cos(a) * length;
  const tipY = cy + Math.sin(a) * length + sag;

  const halfwidth = length * 0.17;
  const px = -Math.sin(a);
  const py = Math.cos(a);

  const midT = 0.5;
  const midX = cx + Math.cos(a) * length * midT;
  const midY = cy + Math.sin(a) * length * midT + sag * midT;

  const upperX = midX + px * halfwidth;
  const upperY = midY + py * halfwidth;
  const lowerX = midX - px * halfwidth;
  const lowerY = midY - py * halfwidth;

  return (
    `M${cx.toFixed(1)},${cy.toFixed(1)} ` +
    `Q${upperX.toFixed(1)},${upperY.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} ` +
    `Q${lowerX.toFixed(1)},${lowerY.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}Z`
  );
}

function generatePalm(spec: PalmSpec) {
  const cx = 100;
  const baseY = 400;
  const crownY = baseY - spec.height;

  const c1x = cx + spec.trunkCurveX;
  const c1y = baseY - spec.height * 0.35;
  const c2x = cx - spec.trunkCurveX * 0.5;
  const c2y = baseY - spec.height * 0.75;
  const crownX = cx + Math.tan((spec.leanDeg * Math.PI) / 180) * spec.height * 0.4;
  const trunk =
    `M${cx},${baseY} ` +
    `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ` +
    `${crownX.toFixed(1)},${crownY}`;

  /* Frond angles distributed across upper 300° — skips the straight-down
     wedge where the trunk lives. Take the first N for the spec's count. */
  const baseAngles = [-140, -100, -65, -30, 10, 45, 80, 130, 165];
  const usedAngles = baseAngles.slice(0, spec.fronds);

  const fronds = usedAngles.map((base, i) => {
    const jitter = ((spec.seed * (i + 1)) % 19) - 9;
    const angle = base + jitter;
    const lengthScale = 0.82 + ((spec.seed * (i + 3)) % 28) / 100;
    const length = spec.frondLength * lengthScale;
    const verticality = Math.abs(Math.sin((angle * Math.PI) / 180));
    const sag = 5 + (1 - verticality) * 14;
    return frondPath(angle, length, crownX, crownY, sag);
  });

  return { trunk, fronds, trunkWidth: spec.trunkWidth, crownX, crownY };
}

function PalmSvg({ specIndex }: { specIndex: number }) {
  const spec = PALMS[specIndex % PALMS.length];
  const { trunk, fronds, trunkWidth, crownX, crownY } = generatePalm(spec);
  return (
    <svg
      viewBox="0 0 200 400"
      preserveAspectRatio="xMidYMax meet"
      className="ss-palm-svg"
      aria-hidden="true"
    >
      <path
        d={trunk}
        stroke="currentColor"
        strokeWidth={trunkWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {fronds.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
      {/* tiny crown knot — sells the silhouette */}
      <circle cx={crownX} cy={crownY} r={trunkWidth * 0.55} fill="currentColor" />
    </svg>
  );
}

type SlotProps = {
  specIndex: number;
  left?: string;
  right?: string;
};

function PalmSlot({ specIndex, left, right }: SlotProps) {
  return (
    <div className="ss-palm-slot" style={{ left, right }}>
      <PalmSvg specIndex={specIndex} />
    </div>
  );
}

/* ─── Three depth planes for the cinematic strip ─── */

export function PalmsBack() {
  return (
    <div className="ss-palms ss-palms-back" aria-hidden="true">
      <PalmSlot specIndex={2} left="2%" />
      <PalmSlot specIndex={1} left="12%" />
      <PalmSlot specIndex={4} left="22%" />
      <PalmSlot specIndex={0} left="34%" />
      <PalmSlot specIndex={5} left="46%" />
      <PalmSlot specIndex={3} left="58%" />
      <PalmSlot specIndex={2} left="70%" />
      <PalmSlot specIndex={1} left="82%" />
      <PalmSlot specIndex={4} left="92%" />
    </div>
  );
}

export function PalmsMid() {
  return (
    <div className="ss-palms ss-palms-mid" aria-hidden="true">
      <PalmSlot specIndex={3} left="14%" />
      <PalmSlot specIndex={5} left="38%" />
      <PalmSlot specIndex={0} left="60%" />
      <PalmSlot specIndex={2} left="84%" />
    </div>
  );
}

export function PalmsFront() {
  return (
    <div className="ss-palms ss-palms-front" aria-hidden="true">
      <PalmSlot specIndex={3} left="-4%" />
      <PalmSlot specIndex={0} right="-4%" />
    </div>
  );
}

/* Header row — same component for the dashboard sticky header silhouette */
export function PalmsHeader() {
  return (
    <div className="ss-palms ss-palms-header" aria-hidden="true">
      <PalmSlot specIndex={2} left="2%" />
      <PalmSlot specIndex={1} left="10%" />
      <PalmSlot specIndex={4} left="18%" />
      <PalmSlot specIndex={0} left="27%" />
      <PalmSlot specIndex={5} left="36%" />
      <PalmSlot specIndex={3} left="45%" />
      <PalmSlot specIndex={2} left="54%" />
      <PalmSlot specIndex={1} left="62%" />
      <PalmSlot specIndex={4} left="71%" />
      <PalmSlot specIndex={0} left="80%" />
      <PalmSlot specIndex={5} left="89%" />
    </div>
  );
}
