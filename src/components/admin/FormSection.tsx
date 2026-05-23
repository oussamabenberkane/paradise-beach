import { ReactNode } from "react";

interface Props {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, icon, children }: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "16px",
        padding: "1.5rem 1.75rem 1.5rem 2rem",
        boxShadow: "var(--tier-1)",
        border: "1px solid var(--border)",
        marginBottom: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent left bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "3px",
          background: "linear-gradient(180deg, var(--accent), var(--accent-2))",
          borderRadius: "3px 0 0 3px",
        }}
      />

      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.25rem",
          paddingBottom: "0.875rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {icon && (
          <span style={{ color: "var(--accent)", display: "flex" }}>{icon}</span>
        )}
        <h3
          style={{
            margin: 0,
            fontSize: "0.6875rem",
            fontWeight: 800,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}
