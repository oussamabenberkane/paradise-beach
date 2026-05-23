"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getEvent, getTicketsByEvent, updateTiers } from "@/lib/admin-store";
import Toast from "@/components/admin/Toast";
import type { Event, TicketTier } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const th: React.CSSProperties = {
  padding: "0.625rem 0.75rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  textAlign: "left",
  borderBottom: "1px solid var(--border)",
  background: "var(--surface-2)",
};

const td: React.CSSProperties = {
  padding: "0.625rem 0.75rem",
  borderBottom: "1px solid var(--border)",
};

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
    const e = getEvent(id);
    setEvent(e ?? null);
    const t = getTicketsByEvent(id);
    setTiers(t?.tiers ?? []);
  }, [id]);

  function setTier(index: number, key: keyof TicketTier, value: string) {
    setTiers((prev) =>
      prev.map((t, i) =>
        i === index
          ? {
              ...t,
              [key]:
                key === "name" ? value : parseFloat(value) || 0,
            }
          : t
      )
    );
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      { name: "New Tier", price: 0, total: 100, sold: 0 },
    ]);
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  const dismissToast = useCallback(() => setToast(null), []);

  function handleSave() {
    try {
      updateTiers(id, tiers);
      setToast({ message: "Tiers saved successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to save tiers.", type: "error" });
    }
  }

  return (
    <div style={{ maxWidth: "760px" }}>
      <Link
        href="/admin/tickets"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.8125rem",
          color: "var(--text-3)",
          textDecoration: "none",
          marginBottom: "1.25rem",
          fontWeight: 500,
        }}
      >
        ← Back to Tickets
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              marginBottom: "0.25rem",
            }}
          >
            {event?.title ?? "Manage Tiers"}
          </h1>
          {event && (
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-4)",
              }}
            >
              {new Date(event.date + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {event.venueSection}
            </span>
          )}
        </div>
        <button
          onClick={addTier}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            background: "var(--surface-3)",
            color: "var(--text-2)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "1px solid var(--border-strong)",
            cursor: "pointer",
          }}
        >
          + Add Tier
        </button>
      </div>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "12px",
          boxShadow: "var(--tier-1)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Tier Name</th>
                <th style={th}>Price ($)</th>
                <th style={th}>Total</th>
                <th style={th}>Sold</th>
                <th style={{ ...th, textAlign: "center" }}>Fill</th>
                <th style={{ ...th, width: "60px" }} />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, i) => {
                const pct =
                  tier.total > 0
                    ? Math.round((tier.sold / tier.total) * 100)
                    : 0;
                const barColor =
                  pct >= 90
                    ? "var(--danger)"
                    : pct >= 60
                    ? "var(--warn)"
                    : "var(--success)";

                return (
                  <tr key={i}>
                    <td style={td}>
                      <input
                        style={inputStyle}
                        value={tier.name}
                        onChange={(e) => setTier(i, "name", e.target.value)}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        style={inputStyle}
                        value={tier.price}
                        onChange={(e) => setTier(i, "price", e.target.value)}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min="0"
                        style={inputStyle}
                        value={tier.total}
                        onChange={(e) => setTier(i, "total", e.target.value)}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min="0"
                        style={inputStyle}
                        value={tier.sold}
                        onChange={(e) => setTier(i, "sold", e.target.value)}
                      />
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "60px",
                            height: "6px",
                            background: "var(--surface-3)",
                            borderRadius: "99px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: barColor,
                              borderRadius: "99px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-4)",
                            minWidth: "32px",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <button
                        onClick={() => removeTier(i)}
                        style={{
                          background: "var(--danger-tint)",
                          color: "var(--danger)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.3rem 0.625rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}

              {tiers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...td,
                      textAlign: "center",
                      color: "var(--text-4)",
                      padding: "2rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    No tiers yet. Click "+ Add Tier" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: "0.625rem 1.75rem",
          borderRadius: "8px",
          background: "var(--accent)",
          color: "#fff",
          fontSize: "0.875rem",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
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
