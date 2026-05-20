import eventsData from "@/data/events.json";
import singersData from "@/data/singers.json";
import ticketsData from "@/data/tickets.json";
import type { Singer, Event, EventTickets } from "@/lib/types";
import { AppShell } from "@/components/nav/AppShell";
import { TicketSortControl, type EventRow } from "./TicketSortControl";
import { formatCurrency } from "@/lib/utils";
import { Ticket, TrendingUp, Users, Zap } from "lucide-react";

const singers = singersData as Singer[];
const events = eventsData as Event[];
const allTickets = ticketsData as EventTickets[];

const today = new Date().toISOString().split("T")[0];

// ── Build joined rows ────────────────────────────────
const rows: EventRow[] = events
  .map((event) => {
    const tickets = allTickets.find((t) => t.eventId === event.id) ?? null;
    const headliner = singers.find((s) => s.id === event.headlinerId) ?? null;
    const totalSold = tickets?.tiers.reduce((s, t) => s + t.sold, 0) ?? 0;
    const totalCapacity = tickets?.tiers.reduce((s, t) => s + t.total, 0) ?? 0;
    const fillRate = totalCapacity > 0 ? totalSold / totalCapacity : 0;
    const revenue = tickets?.tiers.reduce((s, t) => s + t.sold * t.price, 0) ?? 0;
    const isSoldOut = tickets ? tickets.tiers.every((t) => t.sold === t.total) : false;
    return { event, headliner, tickets, totalSold, totalCapacity, fillRate, revenue, isSoldOut };
  })
  .sort((a, b) => a.event.date.localeCompare(b.event.date));

// ── Global KPIs ──────────────────────────────────────
const kpiTotalSold = rows.reduce((s, r) => s + r.totalSold, 0);
const kpiTotalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
const kpiAvgFillRate =
  rows.length > 0 ? rows.reduce((s, r) => s + r.fillRate, 0) / rows.length : 0;
const kpiSoldOutEvents = rows.filter((r) => r.isSoldOut).length;

// ── Tier aggregation ────────────────────────────────
const TIER_NAMES = ["VIP", "General", "Backstage Pass"] as const;
type TierName = (typeof TIER_NAMES)[number];

type TierSummary = {
  tierName: TierName;
  sold: number;
  total: number;
  revenue: number;
  fillRate: number;
};

const tierSummaries: TierSummary[] = TIER_NAMES.map((tierName) => {
  const matching = allTickets.flatMap((et) =>
    et.tiers.filter((t) => t.name === tierName)
  );
  if (matching.length === 0) return null;
  const sold = matching.reduce((s, t) => s + t.sold, 0);
  const total = matching.reduce((s, t) => s + t.total, 0);
  const revenue = matching.reduce((s, t) => s + t.sold * t.price, 0);
  const fillRate = total > 0 ? sold / total : 0;
  return { tierName, sold, total, revenue, fillRate };
}).filter((t): t is TierSummary => t !== null);

// ── Tier card visual styles ──────────────────────────
const TIER_STYLES: Record<
  TierName,
  {
    bg: string;
    border: string;
    accent: string;
    iconBg: string;
    emoji: string;
    barBg: string;
    barFill: string;
  }
> = {
  VIP: {
    bg: "var(--warn-tint)",
    border: "rgba(245, 166, 35, 0.25)",
    accent: "var(--warn)",
    iconBg: "rgba(245, 166, 35, 0.22)",
    emoji: "👑",
    barBg: "rgba(245, 166, 35, 0.2)",
    barFill: "var(--warn)",
  },
  General: {
    bg: "var(--surface-2)",
    border: "var(--border)",
    accent: "var(--text-3)",
    iconBg: "var(--surface-3)",
    emoji: "🎟",
    barBg: "var(--surface-3)",
    barFill: "var(--success)",
  },
  "Backstage Pass": {
    bg: "var(--accent-tint)",
    border: "var(--accent-tint-2)",
    accent: "var(--accent)",
    iconBg: "var(--accent-tint-2)",
    emoji: "🎭",
    barBg: "var(--accent-tint-2)",
    barFill: "var(--accent)",
  },
};

// ── Page ─────────────────────────────────────────────
export default function TicketsPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--accent-tint-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ticket size={18} color="var(--accent)" strokeWidth={2.2} />
            </div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: 0,
              }}
            >
              Tickets
            </h1>
          </div>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-3)",
              margin: "6px 0 0 46px",
              fontWeight: 500,
            }}
          >
            Season sales overview
          </p>
        </div>

        {/* KPI row */}
        <section style={{ marginBottom: 28 }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
            <KpiChip
              icon={<Ticket size={17} color="var(--accent)" strokeWidth={2.2} />}
              value={kpiTotalSold.toLocaleString("en-GB")}
              label="Total Sold"
            />
            <KpiChip
              icon={<TrendingUp size={17} color="var(--accent)" strokeWidth={2.2} />}
              value={formatCurrency(kpiTotalRevenue)}
              label="Total Revenue"
            />
            <KpiChip
              icon={<Users size={17} color="var(--accent)" strokeWidth={2.2} />}
              value={`${Math.round(kpiAvgFillRate * 100)}%`}
              label="Avg Fill Rate"
            />
            <KpiChip
              icon={<Zap size={17} color="var(--accent)" strokeWidth={2.2} />}
              value={String(kpiSoldOutEvents)}
              label="Sold-Out Events"
            />
          </div>
        </section>

        {/* Sort + table */}
        <section style={{ marginBottom: 28 }}>
          <SectionLabel>All Events</SectionLabel>
          <TicketSortControl rows={rows} today={today} />
        </section>

        {/* Tier breakdown */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Revenue by Tier Type</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {tierSummaries.map((ts) => {
              const styles = TIER_STYLES[ts.tierName];
              const pct = Math.round(ts.fillRate * 100);
              return (
                <div
                  key={ts.tierName}
                  style={{
                    background: styles.bg,
                    borderRadius: 20,
                    padding: "24px 26px",
                    border: `1px solid ${styles.border}`,
                    boxShadow: "var(--tier-1)",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: styles.accent,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        {ts.tierName}
                      </div>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "var(--text)",
                          letterSpacing: "-0.03em",
                          lineHeight: 1,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatCurrency(ts.revenue)}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: styles.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {styles.emoji}
                    </div>
                  </div>

                  {/* Sold + fill rate metrics */}
                  <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text)",
                          lineHeight: 1.2,
                        }}
                      >
                        {ts.sold.toLocaleString("en-GB")}
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-4)",
                            fontWeight: 500,
                          }}
                        >
                          /{ts.total}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-4)",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          marginTop: 3,
                        }}
                      >
                        Sold
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text)",
                          lineHeight: 1.2,
                        }}
                      >
                        {pct}%
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-4)",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          marginTop: 3,
                        }}
                      >
                        Fill Rate
                      </div>
                    </div>
                  </div>

                  {/* Fill bar */}
                  <div
                    style={{
                      height: 5,
                      borderRadius: 100,
                      background: styles.barBg,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 100,
                        background: styles.barFill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ height: 16 }} />
      </div>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--text-4)",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        margin: "0 0 12px 0",
      }}
    >
      {children}
    </h2>
  );
}

function KpiChip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "var(--tier-1)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--accent-tint-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-mono)",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            marginTop: 5,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
