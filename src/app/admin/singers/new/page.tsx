"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSinger } from "@/lib/admin-store";

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

export default function NewSingerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    nationality: "",
    genre: "",
    bio: "",
    photo: "",
    instagram: "",
    spotify: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    createSinger({
      name: form.name.trim(),
      nationality: form.nationality.trim(),
      genre: form.genre
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      bio: form.bio.trim(),
      photo: form.photo.trim() || `/images/singers/${form.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
      socialLinks: {
        instagram: form.instagram.trim() || undefined,
        spotify: form.spotify.trim() || undefined,
      },
    });

    router.push("/admin/singers");
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          marginBottom: "1.75rem",
        }}
      >
        Add Singer
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
            <label style={labelStyle}>Name *</label>
            <input
              required
              style={inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Artist name"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nationality</label>
            <input
              style={inputStyle}
              value={form.nationality}
              onChange={(e) => set("nationality", e.target.value)}
              placeholder="e.g. Senegalese"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Genre{" "}
              <span style={{ fontWeight: 400, color: "var(--text-4)" }}>
                (comma-separated)
              </span>
            </label>
            <input
              style={inputStyle}
              value={form.genre}
              onChange={(e) => set("genre", e.target.value)}
              placeholder="e.g. Afrobeats, Soul"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Bio</label>
            <textarea
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Short artist biography"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Photo URL</label>
            <input
              style={inputStyle}
              value={form.photo}
              onChange={(e) => set("photo", e.target.value)}
              placeholder="/images/singers/name.jpg"
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
              <label style={labelStyle}>Instagram</label>
              <input
                style={inputStyle}
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@handle"
              />
            </div>
            <div>
              <label style={labelStyle}>Spotify</label>
              <input
                style={inputStyle}
                value={form.spotify}
                onChange={(e) => set("spotify", e.target.value)}
                placeholder="artist-slug"
              />
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
              Create Singer
            </button>
            <Link
              href="/admin/singers"
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
