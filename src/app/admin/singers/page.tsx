"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSingers, deleteSinger } from "@/lib/admin-store";
import AdminTable from "@/components/admin/AdminTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Singer } from "@/lib/types";

const td: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  color: "var(--text-2)",
  borderBottom: "1px solid var(--border)",
};

export default function SingersPage() {
  const router = useRouter();
  const [singers, setSingers] = useState<Singer[]>([]);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setSingers(getSingers());
  }, []);

  const filtered = singers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    deleteSinger(id);
    setSingers(getSingers());
  }

  return (
    <div style={{ maxWidth: "960px" }}>
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
          Singers
        </h1>
        <Link
          href="/admin/singers/new"
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
          + Add Singer
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "0.5rem 0.875rem",
          borderRadius: "8px",
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
          color: "var(--text)",
          fontSize: "0.875rem",
          marginBottom: "1rem",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <AdminTable
        headers={["Name", "Genre", "Nationality", "Events", "Actions"]}
      >
        {filtered.map((singer) => (
          <tr key={singer.id}>
            <td style={{ ...td, fontWeight: 600, color: "var(--text)" }}>
              {singer.name}
            </td>
            <td style={td}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {singer.genre.map((g) => (
                  <span
                    key={g}
                    style={{
                      background: "var(--accent-tint)",
                      color: "var(--accent)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "99px",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </td>
            <td style={td}>{singer.nationality}</td>
            <td style={{ ...td, color: "var(--text-3)" }}>
              {singer.eventIds.length}
            </td>
            <td style={td}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/admin/singers/${singer.id}/edit`}
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
                  onClick={() => setConfirmId(singer.id)}
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
        {filtered.length === 0 && (
          <tr>
            <td
              colSpan={5}
              style={{
                ...td,
                textAlign: "center",
                color: "var(--text-4)",
                padding: "2rem",
              }}
            >
              No singers found.
            </td>
          </tr>
        )}
      </AdminTable>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete Singer"
        description="Are you sure you want to delete this singer? This action cannot be undone."
        onConfirm={() => {
          if (confirmId) handleDelete(confirmId);
        }}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
