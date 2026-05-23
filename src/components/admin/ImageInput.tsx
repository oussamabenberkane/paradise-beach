"use client";
import { useState } from "react";
import { ImageIcon, X, Link } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  aspect?: "square" | "wide";
  fallbackLabel?: string;
}

export default function ImageInput({
  value,
  onChange,
  placeholder = "/images/...",
  aspect = "wide",
  fallbackLabel,
}: Props) {
  const [err, setErr] = useState(false);

  const isWide = aspect === "wide";

  function handleChange(url: string) {
    onChange(url);
    setErr(false);
  }

  const showImg = !!value && !err;

  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
      {/* Preview */}
      <div
        style={{
          flexShrink: 0,
          width: isWide ? "160px" : "96px",
          aspectRatio: isWide ? "16/9" : "1/1",
          borderRadius: "10px",
          background: "var(--surface-2)",
          border: "1.5px solid var(--border)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {showImg ? (
          <img
            src={value}
            alt="Preview"
            onError={() => setErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "1rem",
            }}
          >
            <ImageIcon
              size={isWide ? 22 : 18}
              style={{ color: "var(--text-4)" }}
            />
            {fallbackLabel && (
              <span
                style={{
                  fontSize: isWide ? "1.125rem" : "0.875rem",
                  fontWeight: 800,
                  color: "var(--text-3)",
                  textAlign: "center",
                  letterSpacing: "-0.02em",
                }}
              >
                {fallbackLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* URL input */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              color: "var(--text-4)",
              pointerEvents: "none",
            }}
          >
            <Link size={13} />
          </span>
          <input
            className="admin-input"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "0.625rem 2.25rem 0.625rem 2.25rem",
              borderRadius: "10px",
              border: "1.5px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.8125rem",
              fontFamily: "var(--font-mono, monospace)",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => handleChange("")}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-4)",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
        {err && value && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--danger)",
              fontWeight: 500,
            }}
          >
            Could not load image — check the URL
          </span>
        )}
        <span style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>
          Enter a full URL or a path starting with /
        </span>
      </div>
    </div>
  );
}
