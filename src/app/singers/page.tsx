import { AppShell } from "@/components/nav/AppShell";
import { SingerFilterBar } from "@/components/singers/SingerFilterBar";
import { Mic2 } from "lucide-react";
import singersData from "@/data/singers.json";
import eventsData from "@/data/events.json";
import type { Singer, Event } from "@/lib/types";

const singers = singersData as Singer[];
const events = eventsData as Event[];

export default function SingersPage() {
  const today = new Date().toISOString().split("T")[0];

  const upcomingCountMap: Record<string, number> = {};
  singers.forEach((s) => {
    upcomingCountMap[s.id] = events.filter(
      (e) =>
        e.date >= today &&
        (e.headlinerId === s.id || e.supportIds.includes(s.id))
    ).length;
  });

  return (
    <AppShell>
      <div style={{ maxWidth: "1200px" }}>
        {/* Page header */}
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <Mic2 size={22} color="var(--accent)" strokeWidth={2} />
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Artists
            </h1>
          </div>
          <p style={{ color: "var(--text-3)", fontSize: "14px", margin: 0 }}>
            {singers.length} artists performing this season
          </p>
        </div>

        <SingerFilterBar singers={singers} upcomingCountMap={upcomingCountMap} />
      </div>
    </AppShell>
  );
}
