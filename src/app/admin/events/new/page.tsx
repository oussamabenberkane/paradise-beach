"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Users,
  ImageIcon,
  Mic2,
  Check,
} from "lucide-react";
import { createEvent, getSingers } from "@/lib/admin-store";
import FormSection from "@/components/admin/FormSection";
import FormField from "@/components/admin/FormField";
import TagInput from "@/components/admin/TagInput";
import ImageInput from "@/components/admin/ImageInput";
import AutoTextarea from "@/components/admin/AutoTextarea";
import NumberStepper from "@/components/admin/NumberStepper";
import DatePicker from "@/components/admin/DatePicker";
import TimePicker from "@/components/admin/TimePicker";
import SingerDropdown from "@/components/admin/SingerDropdown";
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

export default function NewEventPage() {
  const router = useRouter();
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

  useEffect(() => {
    setSingers(getSingers());
  }, []);

  function toggleSupport(id: string) {
    setSupportIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleHeadlinerChange(id: string) {
    setHeadlinerId(id);
    setSupportIds((prev) => prev.filter((s) => s !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !headlinerId) return;

    createEvent({
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
          Add Event
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Details */}
        <FormSection title="Details" icon={<FileText size={13} />}>
          <FormField label="Title" required>
            <input
              required
              className="admin-input"
              style={inp}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset Groove"
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
              placeholder="e.g. Main Stage, Beach Terrace…"
            />
          </FormField>
        </FormSection>

        {/* Lineup */}
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
            hint={
              headlinerId
                ? "Click to toggle"
                : "Select a headliner first"
            }
            style={{ marginBottom: 0 }}
          >
            {supportCandidates.length === 0 && !headlinerId ? (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1.5px dashed var(--border-strong)",
                  textAlign: "center",
                  color: "var(--text-4)",
                  fontSize: "0.875rem",
                }}
              >
                Select a headliner to see support options
              </div>
            ) : (
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
                        background: on
                          ? "var(--accent-tint)"
                          : "var(--surface)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.12s, background 0.12s",
                        position: "relative",
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
            )}
          </FormField>
        </FormSection>

        {/* Media & Content */}
        <FormSection title="Media & Content" icon={<ImageIcon size={13} />}>
          <FormField label="Description">
            <AutoTextarea
              value={description}
              onChange={setDescription}
              placeholder="Describe the event vibe, artists, and experience…"
              minRows={3}
              maxLength={800}
            />
          </FormField>

          <FormField
            label="Cover Image"
            hint="Enter a URL to see a live preview"
          >
            <ImageInput
              value={coverImage}
              onChange={setCoverImage}
              aspect="wide"
              placeholder="/images/events/event-name.jpg"
              fallbackLabel={title ? title.split(" ")[0] : undefined}
            />
          </FormField>

          <FormField label="Tags" hint="Press Enter or comma to add" style={{ marginBottom: 0 }}>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="e.g. afrobeats, soul, sunset…"
            />
          </FormField>
        </FormSection>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
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
            Create Event
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
      </form>
    </div>
  );
}
