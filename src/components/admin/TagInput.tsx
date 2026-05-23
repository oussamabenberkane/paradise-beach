"use client";
import { useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter…",
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        alignItems: "center",
        padding: "0.5rem 0.75rem",
        borderRadius: "10px",
        border: "1.5px solid var(--border-strong)",
        background: "var(--surface)",
        cursor: "text",
        minHeight: "46px",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 10px 3px 12px",
            borderRadius: "99px",
            background: "var(--accent-tint)",
            color: "var(--accent)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            border: "1px solid var(--accent-tint-2)",
          }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--accent)",
              padding: 0,
              display: "flex",
              alignItems: "center",
              opacity: 0.7,
              lineHeight: 1,
            }}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={value.length === 0 ? placeholder : ""}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "0.875rem",
          color: "var(--text)",
          flex: "1 1 100px",
          minWidth: "100px",
          padding: "2px 0",
        }}
      />
    </div>
  );
}
