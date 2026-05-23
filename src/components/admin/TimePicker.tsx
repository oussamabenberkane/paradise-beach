"use client";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";

interface Props {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
}

export default function TimePicker({ value, onChange }: Props) {
  const parts = value ? value.split(":") : ["19", "00"];
  const h = parseInt(parts[0] ?? "19", 10);
  const m = parseInt(parts[1] ?? "00", 10);

  function emit(newH: number, newM: number) {
    onChange(
      `${String(((newH % 24) + 24) % 24).padStart(2, "0")}:${String(
        ((newM % 60) + 60) % 60
      ).padStart(2, "0")}`
    );
  }

  const spinBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 6px",
    borderRadius: "6px",
    lineHeight: 1,
    transition: "background 0.1s, color 0.1s",
  };

  const col = (
    value: number,
    onUp: () => void,
    onDown: () => void,
    isHour: boolean
  ) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
      }}
    >
      <button type="button" className="spin-btn" style={spinBtn} onClick={onUp}>
        <ChevronUp size={13} />
      </button>
      <span
        style={{
          fontSize: "1.125rem",
          fontWeight: 800,
          color: "var(--text)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          minWidth: "2ch",
          textAlign: "center",
          lineHeight: 1,
          padding: "4px 2px",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <button type="button" className="spin-btn" style={spinBtn} onClick={onDown}>
        <ChevronDown size={13} />
      </button>
    </div>
  );

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.375rem 0.875rem",
        borderRadius: "10px",
        border: "1.5px solid var(--border-strong)",
        background: "var(--surface)",
      }}
    >
      <Clock size={13} style={{ color: "var(--text-4)", flexShrink: 0, marginRight: "2px" }} />
      {col(
        h,
        () => emit(h + 1, m),
        () => emit(h - 1, m),
        true
      )}
      <span
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "var(--text-3)",
          lineHeight: 1,
          marginBottom: "2px",
          userSelect: "none",
        }}
      >
        :
      </span>
      {col(
        m,
        () => emit(h, m + 5),
        () => emit(h, m - 5),
        false
      )}
    </div>
  );
}
