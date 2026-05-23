"use client";

import { useState } from "react";
import Link from "next/link";
import type { TicketTier } from "@/lib/types";
import {
  addRegistration,
  getAvailableCount,
} from "@/lib/registrations-store";
import { formatCurrency } from "@/lib/utils";

type Step = "select" | "form" | "success";

interface Props {
  eventId: string;
  tiers: TicketTier[];
  eventTitle: string;
}

export function TicketSelector({ eventId, tiers, eventTitle }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const available = tiers.map((tier) => ({
    tier,
    avail: getAvailableCount(eventId, tier.name, tier.total, tier.sold),
  }));

  function handleConfirm() {
    if (!selectedTier || !name.trim() || !email.trim()) return;
    const reg = addRegistration({
      eventId,
      tierName: selectedTier.name,
      quantity,
      name: name.trim(),
      email: email.trim(),
    });
    setConfirmationCode(reg.confirmationCode);
    setStep("success");
  }

  const maxQty = selectedTier
    ? Math.min(
        10,
        getAvailableCount(eventId, selectedTier.name, selectedTier.total, selectedTier.sold)
      )
    : 10;

  return (
    <div style={{ fontFamily: "var(--font-sans-sunset), system-ui, sans-serif" }}>
      {step === "select" && (
        <>
          <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--ss-ink)", marginBottom: "1.5rem", letterSpacing: "-0.025em" }}>
            Choose Your Tickets
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {available.map(({ tier, avail }) => {
              const isSelected = selectedTier?.name === tier.name;
              const isSoldOut = avail <= 0;
              return (
                <button
                  key={tier.name}
                  onClick={() => { if (!isSoldOut) { setSelectedTier(tier); setQuantity(1); } }}
                  disabled={isSoldOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.1rem 1.25rem",
                    background: isSelected ? "rgba(255,210,63,0.08)" : "var(--ss-surface)",
                    border: `1.5px solid ${isSelected ? "var(--ss-neon)" : "var(--ss-border)"}`,
                    borderRadius: 16,
                    cursor: isSoldOut ? "not-allowed" : "pointer",
                    opacity: isSoldOut ? 0.5 : 1,
                    textAlign: "left",
                    color: "var(--ss-ink)",
                    transition: "border-color 0.18s, background 0.18s",
                    boxShadow: isSelected ? "0 0 0 1px var(--ss-neon), 0 0 20px rgba(255,210,63,0.15)" : "none",
                    width: "100%",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{tier.name}</span>
                      {isSoldOut && (
                        <span style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.18em",
                          padding: "0.2rem 0.5rem",
                          background: "rgba(229,57,53,0.15)",
                          color: "#e53935",
                          border: "1px solid rgba(229,57,53,0.3)",
                          borderRadius: 999,
                        }}>
                          SOLD OUT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--ss-ink-3)", marginTop: "0.25rem" }}>
                      {avail > 0 ? `${avail} remaining` : "No tickets left"}
                    </div>
                    <div style={{ marginTop: "0.5rem", width: 160 }}>
                      <div style={{ height: 4, background: "rgba(255,241,184,0.1)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.round((tier.sold / tier.total) * 100)}%`, background: "linear-gradient(90deg, var(--ss-neon), var(--ss-neon-2))", borderRadius: 999 }} />
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", color: "var(--ss-neon)", letterSpacing: "-0.01em" }}>
                    {formatCurrency(tier.price)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { if (selectedTier) setStep("form"); }}
            disabled={!selectedTier}
            style={{
              width: "100%",
              padding: "1rem",
              background: selectedTier ? "var(--ss-neon)" : "rgba(255,241,184,0.08)",
              color: selectedTier ? "#160B1F" : "var(--ss-ink-3)",
              border: "none",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: selectedTier ? "pointer" : "not-allowed",
              transition: "background 0.18s, color 0.18s",
              letterSpacing: "0.04em",
              boxShadow: selectedTier ? "0 0 24px rgba(255,210,63,0.4)" : "none",
            }}
          >
            Get Tickets →
          </button>
        </>
      )}

      {step === "form" && selectedTier && (
        <>
          <button
            onClick={() => setStep("select")}
            style={{ background: "none", border: "none", color: "var(--ss-ink-3)", cursor: "pointer", fontSize: "0.82rem", marginBottom: "1.25rem", padding: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            ← Back
          </button>

          <div style={{ background: "var(--ss-surface-2)", border: "1px solid var(--ss-border)", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--ss-ink)" }}>{selectedTier.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ss-neon)", fontWeight: 700 }}>{formatCurrency(selectedTier.price)}</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--ss-ink-3)", marginTop: "0.25rem" }}>{eventTitle}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* Quantity */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--ss-ink-3)", marginBottom: "0.5rem" }}>
                QUANTITY
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--ss-border)", background: "var(--ss-surface)", color: "var(--ss-ink)", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  −
                </button>
                <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--ss-ink)", minWidth: 24, textAlign: "center" }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--ss-border)", background: "var(--ss-surface)", color: "var(--ss-ink)", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  +
                </button>
                <span style={{ fontSize: "0.78rem", color: "var(--ss-ink-3)" }}>max {maxQty}</span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--ss-ink-3)", marginBottom: "0.5rem" }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  background: "var(--ss-surface)",
                  border: "1px solid var(--ss-border)",
                  borderRadius: 12,
                  color: "var(--ss-ink)",
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--ss-ink-3)", marginBottom: "0.5rem" }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  background: "var(--ss-surface)",
                  border: "1px solid var(--ss-border)",
                  borderRadius: 12,
                  color: "var(--ss-ink)",
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1rem", background: "var(--ss-surface-2)", borderRadius: 12, marginBottom: "1rem" }}>
            <span style={{ color: "var(--ss-ink-2)", fontSize: "0.88rem" }}>Total</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--ss-neon)", fontSize: "1.1rem" }}>
              {formatCurrency(selectedTier.price * quantity)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!name.trim() || !email.trim()}
            style={{
              width: "100%",
              padding: "1rem",
              background: name.trim() && email.trim() ? "var(--ss-accent-glow, #E8580C)" : "rgba(255,241,184,0.08)",
              color: name.trim() && email.trim() ? "white" : "var(--ss-ink-3)",
              border: "none",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: name.trim() && email.trim() ? "pointer" : "not-allowed",
              letterSpacing: "0.04em",
              boxShadow: name.trim() && email.trim() ? "0 0 24px rgba(232,88,12,0.4)" : "none",
            }}
          >
            Confirm Reservation
          </button>
        </>
      )}

      {step === "success" && selectedTier && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--ss-ink)", marginBottom: "0.5rem" }}>
            You&apos;re on the strip!
          </h2>
          <p style={{ color: "var(--ss-ink-2)", marginBottom: "2rem" }}>Your reservation is confirmed.</p>

          <div style={{
            background: "var(--ss-surface)",
            border: "2px solid var(--ss-neon)",
            borderRadius: 20,
            padding: "1.75rem",
            marginBottom: "2rem",
            boxShadow: "0 0 32px rgba(255,210,63,0.2)",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.22em", color: "var(--ss-ink-3)", marginBottom: "0.5rem" }}>
              CONFIRMATION CODE
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "2.2rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--ss-neon)",
              textShadow: "0 0 20px rgba(255,210,63,0.5)",
              marginBottom: "1.25rem",
            }}>
              {confirmationCode}
            </div>
            <div style={{ borderTop: "1px dashed var(--ss-border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--ss-ink-3)" }}>Event</span>
                <span style={{ color: "var(--ss-ink)", fontWeight: 600 }}>{eventTitle}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--ss-ink-3)" }}>Tier</span>
                <span style={{ color: "var(--ss-ink)", fontWeight: 600 }}>{selectedTier.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--ss-ink-3)" }}>Quantity</span>
                <span style={{ color: "var(--ss-ink)", fontWeight: 600 }}>{quantity}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--ss-ink-3)" }}>Total</span>
                <span style={{ color: "var(--ss-neon)", fontWeight: 700 }}>{formatCurrency(selectedTier.price * quantity)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/my-tickets"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.85rem 1.4rem",
                background: "var(--ss-neon)",
                color: "#160B1F",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: "0.88rem",
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(255,210,63,0.4)",
              }}
            >
              View My Tickets
            </Link>
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.85rem 1.4rem",
                background: "transparent",
                color: "var(--ss-ink-2)",
                border: "1px solid var(--ss-border)",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: "0.88rem",
                textDecoration: "none",
              }}
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
