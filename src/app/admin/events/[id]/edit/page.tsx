"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Mic2, ImageIcon, Check } from "lucide-react";
import {
  getEvent,
  updateEvent,
  deleteEvent,
  getSingers,
} from "@/lib/admin-store";
import FormSection from "@/components/admin/FormSection";
import FormField from "@/components/admin/FormField";
import TagInput from "@/components/admin/TagInput";
import ImageInput from "@/components/admin/ImageInput";
import AutoTextarea from "@/components/admin/AutoTextarea";
import NumberStepper from "@/components/admin/NumberStepper";
import DatePicker from "@/components/admin/DatePicker";
import TimePicker from "@/components/admin/TimePicker";
import SingerDropdown from "@/components/admin/SingerDropdown";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Event, Singer } from "@/lib/types";

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

const GRAD_STOPS = [
  "#F97316,#FBBF24",
  "#0D9488,#06B6D4",
  "#7C3AED,#EC4899",
  "#EA580C,#F59E0B",
  "#059669,#10B981",
  "#1D4ED8,#6366F1",
  "#D97706,#C2410C",
  "#E11D48,#F472B6",
];

function singerGrad(id: string) {
  const n = parseInt(id.replace(/\D/g, ""), 10);
  return `linear-gradient(135deg, ${GRAD_STOPS[n % GRAD_STOPS.length]})`;
}
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [singers, setSingers] = useState<Singer[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("23:00");
  const [venueSection, setVenueSection] = useState("");
  const [totalCapacity, setTotalCapacity] = useState(400);
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [headlinerId, setHeadlinerId] = useState("");
  const [supportIds, setSupportIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const e = getEvent(id);
    if (!e) { router.replace("/admin/events"); return; }
    setEvent(e);
    setTitle(e.title);
    setDate(e.date);
    setStartTime(e.startTime);
    setEndTime(e.endTime);
    setVenueSection(e.venueSection);
    setTotalCapacity(e.totalCapacity);
    setDescription(e.description);
    setCoverImage(e.coverImage);
    setTags(e.tags ?? []);
    setHeadlinerId(e.headlinerId);
    setSupportIds(e.supportIds);
    setSingers(getSingers());
  }, [id, router]);

  function toggleSupport(singerId: string) {
    setSupportIds((prev) =>
      prev.includes(singerId)
        ? prev.filter((s) => s !== singerId)
        : [...prev, singerId]
    );
  }

  function handleHeadlinerChange(newId: string) {
    setHeadlinerId(newId);
    setSupportIds((prev) => prev.filter((s) => s !== newId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !headlinerId) return;
    updateEvent(id, {
      title: title.trim(),
      date,
      startTime,
      endTime,
      venueSection: venueSection.trim(),
      totalCapacity,
      description: description.trim(),
      coverImage: coverImage.trim(),
      tags,
      headlinerId,
      supportIds,
    });
    router.push("/admin/events");
  }

  function handleDelete() {
    deleteEvent(id);
    router.push("/admin/events");
  }

  if (!event) return null;

  const supportCandidates = singers.filter((s) => s.id !== headlinerId);

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <Link
          href="/admin/events"
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
          ← Events
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
          Edit Event
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection title="Details" icon={<FileText size={13} />}>
          <FormField label="Title" required>
            <input
              required
              className="admin-input"
              style={inp}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              alignItems: "end",
              marginBottom: "1.25rem",
            }}
          >
            <FormField label="Date" required style={{ marginBottom: 0 }}>
              <DatePicker value={date} onChange={setDate} required />
            </FormField>
            <FormField label="Capacity" style={{ marginBottom: 0 }}>
              <NumberStepper
                value={totalCapacity}
                onChange={setTotalCapacity}
                min={0}
                step={50}
              />
            </FormField>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <FormField label="Start Time" style={{ marginBottom: 0 }}>
              <TimePicker value={startTime} onChange={setStartTime} />
            </FormField>
            <FormField label="End Time" style={{ marginBottom: 0 }}>
              <TimePicker value={endTime} onChange={setEndTime} />
            </FormField>
          </div>

          <FormField label="Venue Section" style={{ marginBottom: 0 }}>
            <input
              className="admin-input"
              style={inp}
              value={venueSection}
              onChange={(e) => setVenueSection(e.target.value)}
              placeholder="e.g. Main Stage, Beach Terrace"
            />
          </FormField>
        </FormSection>

        <FormSection title="Lineup" icon={<Mic2 size={13} />}>
          <FormField label="Headliner" required>
            <SingerDropdown
              singers={singers}
              value={headlinerId}
              onChange={handleHeadlinerChange}
            />
          </FormField>

          <FormField
            label="Support Acts"
            hint="Click to toggle"
            style={{ marginBottom: 0 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "0.625rem",
              }}
            >
              {supportCandidates.map((s) => {
                const on = supportIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSupport(s.id)}
                    className="support-pill"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.625rem 0.875rem",
                      borderRadius: "10px",
                      border: on
                        ? "1.5px solid var(--accent)"
                        : "1.5px solid var(--border-strong)",
                      background: on ? "var(--accent-tint)" : "var(--surface)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.12s, background 0.12s",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: singerGrad(s.id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {initials(s.name)}
                    </div>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: on ? "var(--accent)" : "var(--text-2)",
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </span>
                    {on && (
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Check size={9} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </FormField>
        </FormSection>

        <FormSection title="Media & Content" icon={<ImageIcon size={13} />}>
          <FormField label="Description">
            <AutoTextarea
              value={description}
              onChange={setDescription}
              minRows={3}
              maxLength={800}
            />
          </FormField>

          <FormField label="Cover Image" hint="Enter a URL to see a live preview">
            <ImageInput
              value={coverImage}
              onChange={setCoverImage}
              aspect="wide"
              placeholder="/images/events/event-name.jpg"
              fallbackLabel={title ? title.split(" ")[0] : undefined}
            />
          </FormField>

          <FormField label="Tags" hint="Press Enter or comma to add" style={{ marginBottom: 0 }}>
            <TagInput value={tags} onChange={setTags} />
          </FormField>
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
              href="/admin/events"
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
            Delete Event
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Event"
        description={`Delete "${event.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
