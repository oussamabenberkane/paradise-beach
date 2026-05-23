"use client";
import { useEffect } from "react";

interface Props {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 10000,
        padding: "0.75rem 1.25rem",
        borderRadius: "8px",
        background: isSuccess ? "var(--success-tint)" : "var(--danger-tint)",
        border: `1px solid ${isSuccess ? "var(--success)" : "var(--danger)"}`,
        color: isSuccess ? "var(--success)" : "var(--danger)",
        fontSize: "0.875rem",
        fontWeight: 600,
        boxShadow: "var(--tier-2)",
        maxWidth: "320px",
      }}
    >
      {message}
    </div>
  );
}
