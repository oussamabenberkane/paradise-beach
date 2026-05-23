"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import type { Singer } from "@/lib/types";

const GRAD_STOPS = [
  "#F97316,#FBBF24",
  "#0D9488,#06B6D4",
  "#7C3AED,#EC4899",
  "#EA580C,#F59E0B",
  "#059669,#10B981",
  "#1D4ED8,#6366F1",
  "#D97706,#C2410C",
  "#E11D48,#F472B6",
];

function singerGrad(id: string) {
  const n = parseInt(id.replace(/\D/g, ""), 10);
  return `linear-gradient(135deg, ${GRAD_STOPS[n % GRAD_STOPS.length]})`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({
  singer,
  size,
}: {
  singer: Singer;
  size: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: singerGrad(singer.id),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {initials(singer.name)}
    </div>
  );
}

interface Props {
  singers: Singer[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export default function SingerDropdown({
  singers,
  value,
  onChange,
  placeholder = "Select headliner…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = singers.find((s) => s.id === value);
  const filtered = search
    ? singers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : singers;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5rem 0.875rem",
          borderRadius: "10px",
          border: open
            ? "1.5px solid var(--accent)"
            : "1.5px solid var(--border-strong)",
          background: "var(--surface)",
          cursor: "pointer",
          boxShadow: open ? "0 0 0 3px var(--accent-tint)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          userSelect: "none",
          minHeight: "46px",
        }}
      >
        {selected ? (
          <>
            <Avatar singer={selected} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  lineHeight: 1.2,
                }}
              >
                {selected.name}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-4)",
                  marginTop: "1px",
                }}
              >
                {selected.genre.slice(0, 2).join(" · ")}
              </div>
            </div>
          </>
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: "0.875rem",
              color: "var(--text-4)",
            }}
          >
            {placeholder}
          </span>
        )}
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-4)",
            flexShrink: 0,
            transition: "transform 0.18s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 200,
            background: "var(--surface)",
            borderRadius: "14px",
            boxShadow: "var(--tier-3)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 0.875rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <Search size={13} style={{ color: "var(--text-4)", flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.875rem",
                color: "var(--text)",
                flex: 1,
              }}
            />
          </div>

          {/* Options */}
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {filtered.map((singer) => {
              const isActive = singer.id === value;
              return (
                <div
                  key={singer.id}
                  onClick={() => select(singer.id)}
                  className={`dd-option${isActive ? " dd-option-active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.875rem",
                    cursor: "pointer",
                    background: isActive ? "var(--accent-tint)" : "transparent",
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.1s",
                  }}
                >
                  <Avatar singer={singer} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {singer.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-4)",
                        marginTop: "1px",
                      }}
                    >
                      {singer.nationality} · {singer.genre.slice(0, 2).join(", ")}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  color: "var(--text-4)",
                  fontSize: "0.875rem",
                }}
              >
                No singers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
