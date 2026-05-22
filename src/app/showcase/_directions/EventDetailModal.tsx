"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { BeachEvent } from "./paradise-events";
import { GENRE_COLORS } from "./paradise-events";

const LS_KEY = "pb-reservations";

function getReservations(): Record<string, Record<string, number>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveReservations(data: Record<string, Record<string, number>>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function EventDetailModal({
  event,
  onClose,
}: {
  event: BeachEvent;
  onClose: () => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const all = getReservations();
    setQuantities(all[event.id] ?? {});
    setStep("select");
  }, [event.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totalPrice = event.tiers.reduce(
    (sum, tier) => sum + (quantities[tier.name] ?? 0) * tier.price,
    0,
  );
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  function setQty(tierName: string, delta: number) {
    setQuantities((prev) => {
      const curr = prev[tierName] ?? 0;
      const next = Math.max(0, curr + delta);
      if (next === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [tierName]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [tierName]: next };
    });
  }

  function handleReserve() {
    if (step === "select") {
      setStep("confirm");
    } else {
      const all = getReservations();
      all[event.id] = quantities;
      saveReservations(all);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2800);
    }
  }

  const dateStr = new Date(event.date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <motion.div
        className="pb-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.div
        className="pb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pb-modal-title"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pb-modal-img-wrap">
          <img
            src={event.image}
            alt=""
            className="pb-modal-img"
            loading="lazy"
            decoding="async"
          />
          <button className="pb-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <span
            className="pb-modal-genre-tag"
            style={{ background: GENRE_COLORS[event.genre] ?? "#C66B3D" }}
          >
            {event.genre}
          </span>
        </div>

        <div className="pb-modal-body">
          {step === "select" ? (
            <>
              <div className="pb-modal-meta">
                <span className="pb-modal-date">{dateStr}</span>
                <span className="pb-modal-time-label">Doors {event.time}</span>
              </div>
              <h2 id="pb-modal-title" className="pb-modal-title">
                {event.title}
              </h2>
              <p className="pb-modal-artist">{event.artist}</p>
              <p className="pb-modal-desc">{event.description}</p>

              <div className="pb-modal-tiers">
                {event.tiers.map((tier) => {
                  const qty       = quantities[tier.name] ?? 0;
                  const available = tier.total - tier.sold;
                  const isSoldOut = available <= 0;
                  return (
                    <div
                      key={tier.name}
                      className={`pb-tier${isSoldOut ? " is-soldout" : ""}`}
                    >
                      <div className="pb-tier-info">
                        <span className="pb-tier-name">{tier.name}</span>
                        <span className="pb-tier-desc">{tier.description}</span>
                      </div>
                      <div className="pb-tier-right">
                        <span className="pb-tier-price">
                          {tier.price === 0 ? "Free" : `€${tier.price}`}
                        </span>
                        {isSoldOut ? (
                          <span className="pb-tier-soldout-label">Sold out</span>
                        ) : (
                          <div className="pb-tier-qty">
                            <button
                              onClick={() => setQty(tier.name, -1)}
                              disabled={qty === 0}
                              aria-label={`Remove one ${tier.name}`}
                            >
                              −
                            </button>
                            <span aria-live="polite">{qty}</span>
                            <button
                              onClick={() => setQty(tier.name, 1)}
                              disabled={qty >= Math.min(4, available)}
                              aria-label={`Add one ${tier.name}`}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pb-modal-footer">
                <div className="pb-modal-total">
                  {totalItems > 0 ? (
                    <>
                      <span className="pb-modal-total-count">
                        {totalItems} ticket{totalItems > 1 ? "s" : ""}
                      </span>
                      <span className="pb-modal-total-price">€{totalPrice}</span>
                    </>
                  ) : (
                    <span className="pb-modal-total-empty">Select tickets above</span>
                  )}
                </div>
                <button
                  className="pb-reserve-btn"
                  disabled={totalItems === 0}
                  onClick={handleReserve}
                >
                  Reserve
                </button>
              </div>
            </>
          ) : (
            <div className="pb-confirm">
              <div className="pb-confirm-icon" aria-hidden="true">✓</div>
              <h2 className="pb-confirm-title">You&apos;re on the list</h2>
              <p className="pb-confirm-sub">
                {totalItems} ticket{totalItems > 1 ? "s" : ""} reserved for{" "}
                <strong>{event.title}</strong>. A confirmation will be sent to your email.
              </p>
              <div className="pb-confirm-summary">
                {event.tiers
                  .filter((t) => (quantities[t.name] ?? 0) > 0)
                  .map((t) => (
                    <div key={t.name} className="pb-confirm-line">
                      <span>
                        {quantities[t.name]} × {t.name}
                      </span>
                      <span>
                        {t.price === 0
                          ? "Free"
                          : `€${(quantities[t.name] ?? 0) * t.price}`}
                      </span>
                    </div>
                  ))}
                <div className="pb-confirm-total">
                  <span>Total</span>
                  <span>€{totalPrice}</span>
                </div>
              </div>
              <button className="pb-reserve-btn" onClick={handleReserve}>
                Confirm Reservation
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {showToast && (
        <div className="pb-toast" role="alert">
          ✓ Reservation confirmed — check your inbox
        </div>
      )}
    </>
  );
}
