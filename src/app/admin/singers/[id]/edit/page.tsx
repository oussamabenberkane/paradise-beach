"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Music2, ImageIcon, Share2 } from "lucide-react";
import { getSinger, updateSinger, deleteSinger } from "@/lib/admin-store";
import FormSection from "@/components/admin/FormSection";
import FormField from "@/components/admin/FormField";
import TagInput from "@/components/admin/TagInput";
import ImageInput from "@/components/admin/ImageInput";
import AutoTextarea from "@/components/admin/AutoTextarea";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Singer } from "@/lib/types";

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: "10px",
  border: "1.5px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

export default function EditSingerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [singer, setSinger] = useState<Singer | null>(null);
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [instagram, setInstagram] = useState("");
  const [spotify, setSpotify] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const s = getSinger(id);
    if (!s) { router.replace("/admin/singers"); return; }
    setSinger(s);
    setName(s.name);
    setNationality(s.nationality);
    setGenres(s.genre);
    setBio(s.bio);
    setPhoto(s.photo);
    setInstagram(s.socialLinks?.instagram ?? "");
    setSpotify(s.socialLinks?.spotify ?? "");
  }, [id, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    updateSinger(id, {
      name: name.trim(),
      nationality: nationality.trim(),
      genre: genres,
      bio: bio.trim(),
      photo: photo.trim(),
      socialLinks: {
        instagram: instagram.trim() || undefined,
        spotify: spotify.trim() || undefined,
      },
    });
    router.push("/admin/singers");
  }

  function handleDelete() {
    deleteSinger(id);
    router.push("/admin/singers");
  }

  if (!singer) return null;

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <Link
          href="/admin/singers"
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-4)",
            textDecoration: "none",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "0.625rem",
          }}
        >
          ← Singers
        </Link>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Edit Singer
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection title="Identity" icon={<User size={13} />}>
          <FormField label="Name" required>
            <input
              required
              className="admin-input"
              style={inp}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>
          <FormField label="Nationality" style={{ marginBottom: 0 }}>
            <input
              className="admin-input"
              style={inp}
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g. Senegalese"
            />
          </FormField>
        </FormSection>

        <FormSection title="Music" icon={<Music2 size={13} />}>
          <FormField label="Genres" hint="Press Enter or comma to add a genre">
            <TagInput value={genres} onChange={setGenres} />
          </FormField>
          <FormField label="Bio" style={{ marginBottom: 0 }}>
            <AutoTextarea
              value={bio}
              onChange={setBio}
              minRows={4}
              maxLength={600}
            />
          </FormField>
        </FormSection>

        <FormSection title="Photo" icon={<ImageIcon size={13} />}>
          <FormField label="Artist Photo" hint="Enter a URL to see a live preview" style={{ marginBottom: 0 }}>
            <ImageInput
              value={photo}
              onChange={setPhoto}
              aspect="square"
              placeholder="/images/singers/artist-name.jpg"
              fallbackLabel={initials || "?"}
            />
          </FormField>
        </FormSection>

        <FormSection title="Social Links" icon={<Share2 size={13} />}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <FormField label="Instagram" style={{ marginBottom: 0 }}>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.875rem",
                    color: "var(--text-4)",
                    pointerEvents: "none",
                  }}
                >
                  @
                </span>
                <input
                  className="admin-input"
                  style={{ ...inp, paddingLeft: "1.75rem" }}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="handle"
                />
              </div>
            </FormField>
            <FormField label="Spotify" style={{ marginBottom: 0 }}>
              <input
                className="admin-input"
                style={inp}
                value={spotify}
                onChange={(e) => setSpotify(e.target.value)}
                placeholder="artist-slug"
              />
            </FormField>
          </div>
        </FormSection>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            paddingTop: "0.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "0.9375rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
            <Link
              href="/admin/singers"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                border: "1.5px solid var(--border-strong)",
                color: "var(--text-3)",
                fontSize: "0.9375rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Cancel
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "var(--danger-tint)",
              color: "var(--danger)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              border: "1px solid var(--danger)",
              cursor: "pointer",
            }}
          >
            Delete Singer
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Singer"
        description={`Delete "${singer.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
