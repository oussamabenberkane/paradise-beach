"use client";

import React from "react";

/**
 * Tiny zero-dep markdown renderer for the Paradise Beach agent answers.
 * Handles the subset Gemini actually emits: bold, italic, inline + fenced
 * code, headings (# ## ###), unordered + ordered lists, GFM pipe tables,
 * blockquotes, paragraphs. Plus domain-aware decoration for event IDs,
 * EUR prices, percentages, and capacity figures.
 */

const EVENT_ID_RE = /\be\d{1,2}\b/gi;
const PRICE_RE = /€\d+(?:[,]\d{3})*(?:\.\d+)?|\d+(?:[,]\d{3})*\s?EUR/g;
const PERCENT_RE = /[+-]?\d+(?:[.,]\d+)?\s?%/g;
const CAPACITY_RE = /\b\d{3,4}\s?(?:tickets?|seats?|capacity)\b/gi;

type Inline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "bold"; children: Inline[] }
  | { type: "italic"; children: Inline[] }
  | { type: "eventId"; value: string }
  | { type: "price"; value: string }
  | { type: "percent"; value: string }
  | { type: "capacity"; value: string };

/* ─── inline parsing ───────────────────────────────────────────────── */

function decorate(text: string): Inline[] {
  const matches: { start: number; end: number; node: Inline }[] = [];

  for (const re of [EVENT_ID_RE, PRICE_RE, PERCENT_RE, CAPACITY_RE] as const) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const value = m[0];
      const start = m.index;
      const end = start + value.length;
      matches.push({
        start,
        end,
        node:
          re === EVENT_ID_RE
            ? { type: "eventId", value }
            : re === PRICE_RE
              ? { type: "price", value }
              : re === PERCENT_RE
                ? { type: "percent", value }
                : { type: "capacity", value },
      });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const accepted: typeof matches = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      accepted.push(m);
      lastEnd = m.end;
    }
  }

  if (accepted.length === 0) return [{ type: "text", value: text }];

  const out: Inline[] = [];
  let cursor = 0;
  for (const m of accepted) {
    if (m.start > cursor) out.push({ type: "text", value: text.slice(cursor, m.start) });
    out.push(m.node);
    cursor = m.end;
  }
  if (cursor < text.length) out.push({ type: "text", value: text.slice(cursor) });
  return out;
}

function parseInline(input: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(...decorate(buf));
      buf = "";
    }
  };

  while (i < input.length) {
    const c = input[i];

    if (c === "`") {
      const end = input.indexOf("`", i + 1);
      if (end > i) {
        flush();
        out.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (c === "*" && input[i + 1] === "*") {
      const end = input.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ type: "bold", children: parseInline(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (c === "*") {
      const end = input.indexOf("*", i + 1);
      if (end > i + 1 && input[i + 1] !== " " && input[end - 1] !== " ") {
        flush();
        out.push({ type: "italic", children: parseInline(input.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    buf += c;
    i++;
  }
  flush();
  return out;
}

/* ─── inline renderer ──────────────────────────────────────────────── */

function renderInline(nodes: Inline[], keyPrefix = ""): React.ReactNode[] {
  return nodes.map((n, i) => {
    const k = `${keyPrefix}${i}`;
    switch (n.type) {
      case "text":
        return <React.Fragment key={k}>{n.value}</React.Fragment>;
      case "code":
        return <CodeChip key={k}>{n.value}</CodeChip>;
      case "bold":
        return (
          <strong key={k} style={{ fontWeight: 700, color: "#1A1209" }}>
            {renderInline(n.children, `${k}b`)}
          </strong>
        );
      case "italic":
        return (
          <em key={k} style={{ fontStyle: "italic" }}>
            {renderInline(n.children, `${k}i`)}
          </em>
        );
      case "eventId":
        return <EventIdChip key={k}>{n.value}</EventIdChip>;
      case "price":
        return <PriceChip key={k}>{n.value}</PriceChip>;
      case "percent":
        return <PercentChip key={k}>{n.value}</PercentChip>;
      case "capacity":
        return <CapacityChip key={k}>{n.value}</CapacityChip>;
    }
  });
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "0.86em",
        background: "#FFF3E6",
        color: "#3D2B1F",
        padding: "0.08em 0.36em",
        borderRadius: 4,
        border: "1px solid rgba(232,88,12,0.15)",
      }}
    >
      {children}
    </code>
  );
}

function EventIdChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "0.84em",
        fontWeight: 600,
        color: "#E8580C",
        background: "rgba(232,88,12,0.10)",
        padding: "0.08em 0.42em",
        borderRadius: 4,
        border: "1px solid rgba(232,88,12,0.20)",
        letterSpacing: "0.01em",
        verticalAlign: "baseline",
      }}
    >
      {children}
    </span>
  );
}

function PriceChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.15em",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 600,
        color: "#1A1209",
        background: "rgba(232,88,12,0.06)",
        padding: "0.04em 0.38em",
        borderRadius: 4,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </span>
  );
}

function PercentChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 600,
        color: "#1A1209",
      }}
    >
      {children}
    </span>
  );
}

function CapacityChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 600,
        color: "#2D9E5F",
        background: "rgba(45,158,95,0.08)",
        padding: "0.04em 0.38em",
        borderRadius: 4,
      }}
    >
      {children}
    </span>
  );
}

/* ─── block parsing ────────────────────────────────────────────────── */

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "fence"; lang: string | null; code: string }
  | { type: "table"; header: string[]; align: ("left" | "center" | "right" | null)[]; rows: string[][] }
  | { type: "hr" };

function isTableSep(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\||\|$/g, "");
  return trimmed.split("|").map((c) => c.trim());
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const lang = line.trim().slice(3).trim() || null;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "fence", lang, code: codeLines.join("\n") });
      continue;
    }

    if (/^\s*(?:---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(h[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: `h${level}` as "h1" | "h2" | "h3", text: h[2].trim() });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", text: buf.join("\n") });
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c): "left" | "center" | "right" | null => {
        const left = c.startsWith(":");
        const right = c.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return null;
      });
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, align, rows });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|>|```|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") });
  }

  return blocks;
}

/* ─── block renderer ───────────────────────────────────────────────── */

function renderBlock(b: Block, key: number): React.ReactNode {
  switch (b.type) {
    case "h1":
      return (
        <h1
          key={key}
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#1A1209",
            letterSpacing: "-0.02em",
            margin: "1.1rem 0 0.55rem",
            lineHeight: 1.25,
          }}
        >
          {renderInline(parseInline(b.text), `h1-${key}-`)}
        </h1>
      );
    case "h2":
      return (
        <h2
          key={key}
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#1A1209",
            letterSpacing: "-0.015em",
            margin: "1rem 0 0.45rem",
            lineHeight: 1.3,
          }}
        >
          {renderInline(parseInline(b.text), `h2-${key}-`)}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={key}
          style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "#E8580C",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0.85rem 0 0.35rem",
          }}
        >
          {renderInline(parseInline(b.text), `h3-${key}-`)}
        </h3>
      );
    case "paragraph":
      return (
        <p
          key={key}
          style={{
            margin: "0.4rem 0",
            lineHeight: 1.6,
            color: "#3D2B1F",
          }}
        >
          {renderInline(parseInline(b.text), `p-${key}-`)}
        </p>
      );
    case "ul":
      return (
        <ul
          key={key}
          style={{
            margin: "0.4rem 0 0.4rem 0",
            paddingLeft: "1.15rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.18rem",
          }}
        >
          {b.items.map((it, i) => (
            <li
              key={i}
              style={{
                lineHeight: 1.55,
                color: "#3D2B1F",
                paddingLeft: "0.15rem",
                position: "relative",
                listStyle: "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "-0.85rem",
                  top: "0.62em",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#E8580C",
                  opacity: 0.7,
                }}
              />
              {renderInline(parseInline(it), `ul-${key}-${i}-`)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={key}
          style={{
            margin: "0.4rem 0",
            paddingLeft: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.18rem",
            color: "#3D2B1F",
          }}
        >
          {b.items.map((it, i) => (
            <li key={i} style={{ lineHeight: 1.55 }}>
              {renderInline(parseInline(it), `ol-${key}-${i}-`)}
            </li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          style={{
            margin: "0.6rem 0",
            padding: "0.55rem 0.9rem",
            borderLeft: "3px solid rgba(232,88,12,0.25)",
            background: "#FFF8F0",
            color: "#7A5C45",
            borderRadius: "0 6px 6px 0",
            fontStyle: "italic",
            lineHeight: 1.55,
          }}
        >
          {renderInline(parseInline(b.text), `bq-${key}-`)}
        </blockquote>
      );
    case "fence":
      return (
        <pre
          key={key}
          style={{
            margin: "0.6rem 0",
            padding: "0.85rem 1rem",
            background: "#1A1209",
            color: "#FFE8CC",
            borderRadius: 8,
            overflow: "auto",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.82rem",
            lineHeight: 1.55,
            border: "1px solid #3D2B1F",
          }}
        >
          {b.lang && (
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#A68B6E",
                marginBottom: "0.4rem",
              }}
            >
              {b.lang}
            </div>
          )}
          <code style={{ fontFamily: "inherit", color: "inherit" }}>{b.code}</code>
        </pre>
      );
    case "table":
      return (
        <div
          key={key}
          className="md-table-wrap"
          style={{
            margin: "0.7rem 0",
            border: "1px solid rgba(26,18,9,0.10)",
            borderRadius: 8,
            background: "#FFFFFF",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.86rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <thead>
              <tr style={{ background: "#FFF8F0" }}>
                {b.header.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: b.align[i] ?? "left",
                      padding: "0.55rem 0.75rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#7A5C45",
                      borderBottom: "1px solid rgba(26,18,9,0.10)",
                    }}
                  >
                    {renderInline(parseInline(h), `th-${key}-${i}-`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 0 ? "#FFFFFF" : "#FFFCF8",
                    borderTop: ri === 0 ? "none" : "1px solid #FFF3E6",
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        textAlign: b.align[ci] ?? "left",
                        padding: "0.5rem 0.75rem",
                        color: "#3D2B1F",
                        verticalAlign: "top",
                      }}
                    >
                      {renderInline(parseInline(cell), `td-${key}-${ri}-${ci}-`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "hr":
      return (
        <hr
          key={key}
          style={{
            margin: "0.85rem 0",
            border: "none",
            height: 1,
            background: "rgba(26,18,9,0.10)",
          }}
        />
      );
  }
}

/* ─── public component ────────────────────────────────────────────── */

export function Markdown({ source }: { source: string }) {
  const blocks = React.useMemo(() => parseBlocks(source), [source]);
  return (
    <div
      className="md-root"
      style={{
        fontSize: "0.92rem",
        color: "#3D2B1F",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      <style>{`
        .md-root { min-width: 0; }
        .md-root p,
        .md-root li,
        .md-root blockquote,
        .md-root h1,
        .md-root h2,
        .md-root h3 {
          overflow-wrap: break-word;
          word-break: normal;
        }
        .md-root img,
        .md-root svg,
        .md-root video { max-width: 100%; height: auto; }
        .md-root pre { max-width: 100%; overflow-x: auto; overflow-y: hidden; }
        .md-root pre code { white-space: pre; }
        .md-root .md-table-wrap {
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .md-root .md-table-wrap table { width: max-content; min-width: 100%; }
        .md-root .md-table-wrap td,
        .md-root .md-table-wrap th {
          word-break: normal;
          overflow-wrap: normal;
          white-space: normal;
        }
        .md-root a {
          overflow-wrap: anywhere;
          word-break: break-all;
        }
      `}</style>
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}
