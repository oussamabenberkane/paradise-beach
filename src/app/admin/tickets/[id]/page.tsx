"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Ticket } from "lucide-react";
import { getEvent, getTicketsByEvent, updateTiers } from "@/lib/admin-store";
import NumberStepper from "@/components/admin/NumberStepper";
import Toast from "@/components/admin/Toast";
import type { Event, TicketTier } from "@/lib/types";

function FillBar({ sold, total }: { sold: number; total: number }) {
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  const color =
    pct >= 90 ? "var(--danger)" : pct >= 60 ? "var(--warn)" : "var(--success)";
  const bgColor =
    pct >= 90
      ? "var(--danger-tint)"
      : pct >= 60
      ? "var(--warn-tint)"
      : "var(--success-tint)";

  return (
    <div>
      <div
        style={{
          height: "6px",
          background: "var(--surface-3)",
          borderRadius: "99px",
          overflow: "hidden",
          marginBottom: "0.375rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: "99px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color,
            background: bgColor,
            padding: "2px 8px",
            borderRadius: "99px",
          }}
        >
          {pct}% sold
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>
          {total - sold} remaining
        </span>
      </div>
    </div>
  );
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  vip: {
    bg: "var(--warn-tint)",
    text: "var(--warn)",
    border: "rgba(245,166,35,0.3)",
  },
  backstage: {
    bg: "var(--accent-tint-2)",
    text: "var(--accent)",
    border: "var(--accent-tint-2)",
  },
  general: {
    bg: "var(--surface-3)",
    text: "var(--text-3)",
    border: "var(--border)",
  },
};

function tierColor(name: string) {
  const key = name.toLowerCase();
  if (key.includes("vip")) return TIER_COLORS.vip;
  if (key.includes("backstage")) return TIER_COLORS.backstage;
  return TIER_COLORS.general;
}

export default function ManageTiersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setEvent(getEvent(id) ?? null);
    setTiers(getTicketsByEvent(id)?.tiers ?? []);
  }, [id]);

  function setTierField(
    index: number,
    key: keyof TicketTier,
    value: string | number
  ) {
    setTiers((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, [key]: value } : t
      )
    );
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      { name: `Tier ${prev.length + 1}`, price: 0, total: 100, sold: 0 },
    ]);
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  const dismissToast = useCallback(() => setToast(null), []);

  function handleSave() {
    try {
      updateTiers(id, tiers);
      setToast({ message: "Tiers saved!", type: "success" });
    } catch {
      setToast({ message: "Failed to save tiers.", type: "error" });
    }
  }

  const totalRevenue = tiers.reduce((s, t) => s + t.sold * t.price, 0);
  const totalSold = tiers.reduce((s, t) => s + t.sold, 0);

  return (
    <div style={{ maxWidth: "700px" }}>
      {/* Back link */}
      <Link
        href="/admin/tickets"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.8125rem",
          color: "var(--text-4)",
          textDecoration: "none",
          fontWeight: 500,
          marginBottom: "1.25rem",
        }}
      >
        ← Tickets
      </Link>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.04em",
              margin: "0 0 0.375rem",
            }}
          >
            {event?.title ?? "Manage Tiers"}
          </h1>
          {event && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-4)",
                  fontWeight: 500,
                }}
              >
                {new Date(event.date + "T00:00:00").toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "long", year: "numeric" }
                )}{" "}
                · {event.venueSection}
              </span>
              {tiers.length > 0 && (
                <>
                  <span
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "var(--border-strong)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--success)",
                      fontWeight: 600,
                    }}
                  >
                    {totalSold} sold · $
                    {totalRevenue.toLocaleString()} revenue
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={addTier}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
            borderRadius: "10px",
            background: "var(--surface)",
            color: "var(--text-2)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "1.5px solid var(--border-strong)",
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          Add Tier
        </button>
      </div>

      {/* Tier cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {tiers.map((tier, i) => {
          const colors = tierColor(tier.name);
          return (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                borderRadius: "16px",
                boxShadow: "var(--tier-1)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Tier header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <Ticket size={14} style={{ color: colors.text, flexShrink: 0 }} />
                <input
                  value={tier.name}
                  onChange={(e) => setTierField(i, "name", e.target.value)}
                  className="admin-input"
                  style={{
                    flex: 1,
                    border: "1.5px solid transparent",
                    borderRadius: "8px",
                    background: "transparent",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    padding: "4px 8px",
                    outline: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "var(--surface)";
                    e.target.style.borderColor = "var(--accent)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.borderColor = "transparent";
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: colors.bg,
                    color: colors.text,
                    padding: "3px 10px",
                    borderRadius: "99px",
                    border: `1px solid ${colors.border}`,
                    flexShrink: 0,
                  }}
                >
                  {tier.name.toUpperCase()}
                </span>
                <button
                  onClick={() => removeTier(i)}
                  style={{
                    background: "var(--danger-tint)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "var(--danger)",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Tier body */}
              <div style={{ padding: "1.25rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1.25rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {/* Price */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "var(--text-4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Price
                    </div>
                    <NumberStepper
                      value={tier.price}
                      onChange={(n) => setTierField(i, "price", n)}
                      min={0}
                      step={5}
                      prefix="$"
                    />
                  </div>

                  {/* Total */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "var(--text-4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Total
                    </div>
                    <NumberStepper
                      value={tier.total}
                      onChange={(n) => setTierField(i, "total", n)}
                      min={0}
                      step={10}
                    />
                  </div>

                  {/* Sold */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "var(--text-4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Sold
                    </div>
                    <NumberStepper
                      value={tier.sold}
                      onChange={(n) => setTierField(i, "sold", Math.min(n, tier.total))}
                      min={0}
                      max={tier.total}
                      step={1}
                    />
                  </div>
                </div>

                {/* Fill bar */}
                <FillBar sold={tier.sold} total={tier.total} />
              </div>
            </div>
          );
        })}

        {tiers.length === 0 && (
          <div
            style={{
              padding: "3rem",
              borderRadius: "16px",
              border: "2px dashed var(--border-strong)",
              textAlign: "center",
            }}
          >
            <Ticket
              size={32}
              style={{ color: "var(--text-4)", marginBottom: "0.75rem" }}
            />
            <p
              style={{
                color: "var(--text-3)",
                fontSize: "0.9375rem",
                fontWeight: 500,
                margin: 0,
              }}
            >
              No tiers yet
            </p>
            <p
              style={{
                color: "var(--text-4)",
                fontSize: "0.8125rem",
                margin: "0.375rem 0 0",
              }}
            >
              Click "Add Tier" to create your first ticket tier
            </p>
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          padding: "0.75rem 2.5rem",
          borderRadius: "10px",
          background: "var(--accent)",
          color: "#fff",
          fontSize: "0.9375rem",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          letterSpacing: "-0.01em",
        }}
      >
        Save Tiers
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}
