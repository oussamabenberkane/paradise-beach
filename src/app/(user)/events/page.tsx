import { Suspense } from "react";
import { getShowcaseData } from "@/app/showcase/_shared/data";
import { EventFilterBar } from "./EventFilterBar";

export default function EventsPage() {
  const { events } = getShowcaseData();

  return (
    <div
      style={{
        background: "var(--ss-bg)",
        minHeight: "100vh",
        paddingTop: "calc(4rem + 60px)",
        paddingBottom: "4rem",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 3rem)" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-sans-sunset), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.34em",
              color: "var(--ss-neon)",
              marginBottom: "1rem",
              textShadow: "0 0 14px rgba(255,210,63,0.45)",
            }}
          >
            ★ ALL EVENTS · SUMMER &apos;26 ★
          </span>
          <h1
            style={{
              fontFamily: "var(--font-sans-sunset), system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3rem, 8vw, 6rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "var(--ss-ink)",
              margin: 0,
            }}
          >
            LINEUP
          </h1>
        </div>

        {/* Filter bar + grid (client) */}
        <Suspense fallback={<EventsLoading />}>
          <EventFilterBar events={events} />
        </Suspense>
      </div>
    </div>
  );
}

function EventsLoading() {
  return (
    <div style={{ color: "var(--ss-ink-3)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.18em" }}>
      Loading events…
    </div>
  );
}
