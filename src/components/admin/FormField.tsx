import { ReactNode } from "react";

interface Props {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function FormField({ label, required, hint, children, style }: Props) {
  return (
    <div style={{ marginBottom: "1.25rem", ...style }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--text-2)",
          marginBottom: hint ? "0.25rem" : "0.5rem",
          userSelect: "none",
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.875rem",
              lineHeight: 1,
            }}
          >
            *
          </span>
        )}
      </label>
      {hint && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-4)",
            margin: "0 0 0.5rem",
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
