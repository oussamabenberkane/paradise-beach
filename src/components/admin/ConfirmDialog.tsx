"use client";

interface Props {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "12px",
          padding: "1.75rem",
          maxWidth: "420px",
          width: "90%",
          boxShadow: "var(--tier-3)",
        }}
      >
        <h3
          style={{
            margin: "0 0 0.5rem",
            color: "var(--text)",
            fontSize: "1.1rem",
            fontWeight: 700,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "0 0 1.5rem",
            color: "var(--text-3)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid var(--border-strong)",
              background: "transparent",
              color: "var(--text-2)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: "var(--danger)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
