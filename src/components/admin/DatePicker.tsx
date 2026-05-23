"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface Props {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  required,
}: Props) {
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? today.getMonth()
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inPopover = popoverRef.current?.contains(target);
      if (!inTrigger && !inPopover) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 288),
    });
  }, [open]);

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }
  function firstDayOf(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOf(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const selDay = selected?.getDate();
  const selMon = selected?.getMonth();
  const selYr = selected?.getFullYear();
  const todDay = today.getDate();
  const todMon = today.getMonth();
  const todYr = today.getFullYear();

  const displayText = selected
    ? selected.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div ref={triggerRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "0.625rem 0.875rem",
          borderRadius: "10px",
          border: open
            ? "1.5px solid var(--accent)"
            : "1.5px solid var(--border-strong)",
          background: "var(--surface)",
          cursor: "pointer",
          boxShadow: open ? "0 0 0 3px var(--accent-tint)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          userSelect: "none",
        }}
      >
        <Calendar
          size={15}
          style={{ color: displayText ? "var(--accent)" : "var(--text-4)", flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1,
            fontSize: "0.875rem",
            color: displayText ? "var(--text)" : "var(--text-4)",
            fontWeight: displayText ? 500 : 400,
          }}
        >
          {displayText || placeholder}
        </span>
      </div>

      {/* Popover — rendered in a portal so it escapes overflow:hidden parents */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: popoverPos.top,
            left: popoverPos.left,
            width: "288px",
            zIndex: 9999,
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow: "var(--tier-3)",
            border: "1px solid var(--border)",
            padding: "1.125rem",
          }}
        >
          {/* Month nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.875rem",
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              style={{
                background: "var(--surface-2)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                alignItems: "center",
                padding: "5px",
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <span
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                background: "var(--surface-2)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                alignItems: "center",
                padding: "5px",
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: "4px",
            }}
          >
            {DAYS_SHORT.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  color: "var(--text-4)",
                  padding: "4px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
            }}
          >
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;

              const isSel =
                day === selDay &&
                viewMonth === selMon &&
                viewYear === selYr;
              const isTod =
                day === todDay &&
                viewMonth === todMon &&
                viewYear === todYr;

              let cls = "cal-day";
              if (isSel) cls += " cal-day-selected";
              else if (isTod) cls += " cal-day-today";

              return (
                <button
                  key={day}
                  type="button"
                  className={cls}
                  onClick={() => selectDay(day)}
                  style={{
                    padding: "6px 2px",
                    borderRadius: "8px",
                    border: "none",
                    background: isSel
                      ? "var(--accent)"
                      : isTod
                      ? "var(--accent-tint)"
                      : "transparent",
                    color: isSel
                      ? "#fff"
                      : isTod
                      ? "var(--accent)"
                      : "var(--text-2)",
                    fontSize: "0.8125rem",
                    fontWeight: isSel ? 700 : isTod ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "background 0.1s",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
