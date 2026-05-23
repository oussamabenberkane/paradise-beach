"use client";
import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  prefix,
  suffix,
}: Props) {
  function dec() {
    onChange(Math.max(min, value - step));
  }
  function inc() {
    onChange(Math.min(max, value + step));
  }

  const canDec = value > min;
  const canInc = value < max;

  const btnBase: React.CSSProperties = {
    padding: "0.5rem 0.875rem",
    background: "var(--surface-2)",
    border: "none",
    cursor: "pointer",
    color: "var(--text-3)",
    display: "flex",
    alignItems: "center",
    transition: "background 0.1s, color 0.1s",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "10px",
        border: "1.5px solid var(--border-strong)",
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      <button
        type="button"
        onClick={dec}
        disabled={!canDec}
        className="stepper-btn"
        style={{
          ...btnBase,
          borderRight: "1px solid var(--border)",
          opacity: canDec ? 1 : 0.4,
          cursor: canDec ? "pointer" : "not-allowed",
        }}
      >
        <Minus size={14} />
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "0 0.25rem",
        }}
      >
        {prefix && (
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-4)",
              fontWeight: 500,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          className="no-spinner"
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          style={{
            border: "none",
            outline: "none",
            textAlign: "center",
            width: `${Math.max(3, String(Math.max(max === Infinity ? value : max, value)).length + 1)}ch`,
            minWidth: "3ch",
            maxWidth: "7ch",
            padding: "0.5rem 0.25rem",
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "var(--text)",
            background: "transparent",
            fontVariantNumeric: "tabular-nums",
          }}
        />
        {suffix && (
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-4)",
              fontWeight: 500,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={inc}
        disabled={!canInc}
        className="stepper-btn"
        style={{
          ...btnBase,
          borderLeft: "1px solid var(--border)",
          opacity: canInc ? 1 : 0.4,
          cursor: canInc ? "pointer" : "not-allowed",
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
