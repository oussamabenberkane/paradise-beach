"use client";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  maxLength?: number;
}

export default function AutoTextarea({
  value,
  onChange,
  placeholder,
  minRows = 3,
  maxLength,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={minRows}
        className="auto-textarea"
        style={{
          width: "100%",
          padding: "0.75rem 0.875rem",
          paddingBottom: maxLength ? "1.75rem" : "0.75rem",
          borderRadius: "10px",
          border: "1.5px solid var(--border-strong)",
          background: "var(--surface)",
          color: "var(--text)",
          fontSize: "0.875rem",
          lineHeight: 1.65,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          display: "block",
        }}
      />
      {maxLength && (
        <span
          style={{
            position: "absolute",
            bottom: "0.5rem",
            right: "0.75rem",
            fontSize: "0.6875rem",
            fontWeight: 600,
            color:
              value.length > maxLength * 0.9
                ? "var(--warn)"
                : "var(--text-4)",
            pointerEvents: "none",
          }}
        >
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
