"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEvent, getSingers } from "@/lib/admin-store";
import type { Singer } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: "8px",
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--text-2)",
  marginBottom: "0.375rem",
};

const fieldStyle: React.CSSProperties = {
  marginBottom: "1.25rem",
};

export default function NewEventPage() {
  const router = useRouter();
  const [singers, setSingers] = useState<Singer[]>([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venueSection: "",
    totalCapacity: "",
    description: "",
    coverImage: "",
    tags: "",
    headlinerId: "",
  });
  const [supportIds, setSupportIds] = useState<string[]>([]);

  useEffect(() => {
    setSingers(getSingers());
  }, []);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleSupport(id: string) {
    setSupportIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.headlinerId) return;

    createEvent({
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      venueSection: form.venueSection.trim(),
      totalCapacity: parseInt(form.totalCapacity) || 0,
      description: form.description.trim(),
      coverImage: form.coverImage.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      headlinerId: form.headlinerId,
      supportIds,
    });

    router.push("/admin/events");
  }

  const supportCandidates = singers.filter((s) => s.id !== form.headlinerId);

  return (
    <div style={{ maxWidth: "640px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          marginBottom: "1.75rem",
        }}
      >
        Add Event
      </h1>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "12px",
          padding: "1.75rem",
          boxShadow: "var(--tier-1)",
          border: "1px solid var(--border)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Title *</label>
            <input
              required
              style={inputStyle}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Date *</label>
            <input
              required
              type="date"
              style={inputStyle}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label style={labelStyle}>Start Time</label>
              <input
                type="time"
                style={inputStyle}
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input
                type="time"
                style={inputStyle}
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Venue Section</label>
            <input
              style={inputStyle}
              value={form.venueSection}
              onChange={(e) => set("venueSection", e.target.value)}
              placeholder="e.g. Main Stage"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Total Capacity</label>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={form.totalCapacity}
              onChange={(e) => set("totalCapacity", e.target.value)}
              placeholder="500"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Cover Image URL</label>
            <input
              style={inputStyle}
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="/images/events/event-name.jpg"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Tags{" "}
              <span style={{ fontWeight: 400, color: "var(--text-4)" }}>
                (comma-separated)
              </span>
            </label>
            <input
              style={inputStyle}
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="e.g. afrobeats, soul"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Headliner *</label>
            <select
              required
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.headlinerId}
              onChange={(e) => {
                set("headlinerId", e.target.value);
                setSupportIds((prev) =>
                  prev.filter((id) => id !== e.target.value)
                );
              }}
            >
              <option value="">Select headliner…</option>
              {singers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Support Acts</label>
            <div
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: "8px",
                padding: "0.75rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                background: "var(--surface)",
              }}
            >
              {supportCandidates.length === 0 ? (
                <span style={{ fontSize: "0.8125rem", color: "var(--text-4)" }}>
                  Select a headliner first to see support options.
                </span>
              ) : (
                supportCandidates.map((s) => {
                  const checked = supportIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 12px",
                        borderRadius: "99px",
                        border: `1px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
                        background: checked
                          ? "var(--accent-tint)"
                          : "transparent",
                        color: checked ? "var(--accent)" : "var(--text-3)",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{ display: "none" }}
                        checked={checked}
                        onChange={() => toggleSupport(s.id)}
                      />
                      {s.name}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "0.625rem 1.5rem",
                borderRadius: "8px",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Create Event
            </button>
            <Link
              href="/admin/events"
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "8px",
                border: "1px solid var(--border-strong)",
                color: "var(--text-2)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
