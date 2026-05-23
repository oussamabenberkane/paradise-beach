import { ReactNode } from "react";

interface Props {
  headers: string[];
  children: ReactNode;
}

export default function AdminTable({ headers, children }: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "12px",
        boxShadow: "var(--tier-1)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)" }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  borderBottom: "1px solid var(--border)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
