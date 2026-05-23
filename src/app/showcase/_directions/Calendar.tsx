"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { BEACH_EVENTS, GENRE_COLORS } from "./paradise-events";
import type { BeachEvent } from "./paradise-events";
import { EventDetailModal } from "./EventDetailModal";

const TODAY = "2026-05-22";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number) {
  const firstDow    = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mon-start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells: { date: string; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    cells.push({ date: toIso(prevY, prevM, daysInPrev - i), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toIso(year, month, d), isCurrentMonth: true });
  }
  const needed = 42 - cells.length;
  for (let d = 1; d <= needed; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    cells.push({ date: toIso(nextY, nextM, d), isCurrentMonth: false });
  }

  const rows: { date: string; isCurrentMonth: boolean }[][] = [];
  for (let i = 0; i < 42; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function buildWeek(base: string): string[] {
  const d   = new Date(base + "T00:00:00");
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(mon);
    day.setDate(mon.getDate() + i);
    return day.toISOString().split("T")[0];
  });
}

export function Calendar() {
  const [view, setView]         = useState<"month" | "week">("month");
  const [year, setYear]         = useState(2026);
  const [month, setMonth]       = useState(4); // May (0-indexed)
  const [weekBase, setWeekBase] = useState(TODAY);
  const [selectedEvent, setSelectedEvent] = useState<BeachEvent | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) setView("week");
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, BeachEvent[]> = {};
    for (const ev of BEACH_EVENTS) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekDays  = useMemo(() => buildWeek(weekBase), [weekBase]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function prevWeek() {
    const d = new Date(weekBase + "T00:00:00");
    d.setDate(d.getDate() - 7);
    setWeekBase(d.toISOString().split("T")[0]);
  }
  function nextWeek() {
    const d = new Date(weekBase + "T00:00:00");
    d.setDate(d.getDate() + 7);
    setWeekBase(d.toISOString().split("T")[0]);
  }

  return (
    <section id="calendar" className="pb-cal">
      <div className="pb-cal-inner">
        <div className="pb-cal-hd">
          <div>
            <span className="pb-eyebrow">Upcoming Events</span>
            <h2 className="pb-cal-title">This Summer at Paradise</h2>
          </div>
          <div className="pb-view-toggle">
            <button
              className={`pb-view-btn${view === "month" ? " is-active" : ""}`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`pb-view-btn${view === "week" ? " is-active" : ""}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
          </div>
        </div>

        {view === "month" ? (
          <div className="pb-month">
            <div className="pb-cal-nav">
              <button className="pb-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
              <span className="pb-cal-period">{MONTH_LABELS[month]} {year}</span>
              <button className="pb-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
            </div>
            <div className="pb-month-grid">
              {DOW_HEADERS.map(d => (
                <div key={d} className="pb-month-dow">{d}</div>
              ))}
              {monthGrid.flat().map(({ date, isCurrentMonth }) => {
                const events  = eventsByDate[date] ?? [];
                const isPast  = date < TODAY;
                const isToday = date === TODAY;
                const dayNum  = parseInt(date.split("-")[2], 10);
                return (
                  <div
                    key={date}
                    className={[
                      "pb-day",
                      !isCurrentMonth && "is-overflow",
                      isPast          && "is-past",
                      isToday         && "is-today",
                      events.length   && "has-events",
                    ].filter(Boolean).join(" ")}
                    onClick={() => events[0] && setSelectedEvent(events[0])}
                    role={events[0] ? "button" : undefined}
                    tabIndex={events[0] ? 0 : undefined}
                    onKeyDown={e =>
                      e.key === "Enter" && events[0] && setSelectedEvent(events[0])
                    }
                    aria-label={
                      events[0]
                        ? `${date}: ${events.map(e => e.title).join(", ")}`
                        : undefined
                    }
                  >
                    <span className="pb-day-num">{dayNum}</span>
                    {events.length > 0 && (
                      <div className="pb-day-dots">
                        {events.slice(0, 3).map(ev => (
                          <span
                            key={ev.id}
                            className="pb-day-dot"
                            style={{ background: GENRE_COLORS[ev.genre] }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pb-week">
            <div className="pb-cal-nav">
              <button className="pb-nav-btn" onClick={prevWeek} aria-label="Previous week">‹</button>
              <span className="pb-cal-period">
                {new Date(weekDays[0] + "T00:00:00").toLocaleDateString("en-GB", {
                  day: "numeric", month: "short",
                })}
                {" – "}
                {new Date(weekDays[6] + "T00:00:00").toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
              <button className="pb-nav-btn" onClick={nextWeek} aria-label="Next week">›</button>
            </div>
            <div className="pb-week-grid">
              {weekDays.map(date => {
                const events  = eventsByDate[date] ?? [];
                const isPast  = date < TODAY;
                const isToday = date === TODAY;
                const d       = new Date(date + "T00:00:00");
                return (
                  <div
                    key={date}
                    className={[
                      "pb-week-col",
                      isPast  && "is-past",
                      isToday && "is-today",
                    ].filter(Boolean).join(" ")}
                  >
                    <div className="pb-week-col-hd">
                      <span className="pb-week-dow">
                        {d.toLocaleDateString("en-GB", { weekday: "short" })}
                      </span>
                      <span className="pb-week-daynum">{d.getDate()}</span>
                    </div>
                    <div className="pb-week-events">
                      {events.length === 0 ? (
                        <span className="pb-week-empty">—</span>
                      ) : (
                        events.map(ev => (
                          <button
                            key={ev.id}
                            className="pb-week-event"
                            style={{ borderLeftColor: GENRE_COLORS[ev.genre] }}
                            onClick={() => setSelectedEvent(ev)}
                          >
                            <span className="pb-week-ev-time">{ev.time}</span>
                            <span className="pb-week-ev-title">{ev.title}</span>
                            <span className="pb-week-ev-genre">{ev.genre}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
