"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, getSingers, deleteEvent } from "@/lib/admin-store";
import AdminTable from "@/components/admin/AdminTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Event, Singer } from "@/lib/types";

const td: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  color: "var(--text-2)",
  borderBottom: "1px solid var(--border)",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [singers, setSingers] = useState<Singer[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents().sort((a, b) => a.date.localeCompare(b.date)));
    setSingers(getSingers());
  }, []);

  function singerName(id: string) {
    return singers.find((s) => s.id === id)?.name ?? id;
  }

  function handleDelete(id: string) {
    deleteEvent(id);
    setEvents(getEvents().sort((a, b) => a.date.localeCompare(b.date)));
  }

  return (
    <div style={{ maxWidth: "1080px" }}>
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
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.03em",
          }}
        >
          Events
        </h1>
        <Link
          href="/admin/events/new"
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "8px",
            background: "var(--accent)",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + Add Event
        </Link>
      </div>

      <AdminTable
        headers={[
          "Title",
          "Date",
          "Time",
          "Venue",
          "Headliner",
          "Capacity",
          "Actions",
        ]}
      >
        {events.map((event) => (
          <tr key={event.id}>
            <td style={{ ...td, fontWeight: 600, color: "var(--text)" }}>
              {event.title}
            </td>
            <td style={{ ...td, whiteSpace: "nowrap" }}>
              {formatDate(event.date)}
            </td>
            <td style={{ ...td, whiteSpace: "nowrap", color: "var(--text-3)" }}>
              {event.startTime} – {event.endTime}
            </td>
            <td style={td}>{event.venueSection}</td>
            <td style={td}>{singerName(event.headlinerId)}</td>
            <td style={{ ...td, color: "var(--text-3)" }}>
              {event.totalCapacity.toLocaleString()}
            </td>
            <td style={td}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "6px",
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => setConfirmId(event.id)}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "6px",
                    background: "var(--danger-tint)",
                    color: "var(--danger)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
        {events.length === 0 && (
          <tr>
            <td
              colSpan={7}
              style={{
                ...td,
                textAlign: "center",
                color: "var(--text-4)",
                padding: "2rem",
              }}
            >
              No events yet.
            </td>
          </tr>
        )}
      </AdminTable>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={() => {
          if (confirmId) handleDelete(confirmId);
        }}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
