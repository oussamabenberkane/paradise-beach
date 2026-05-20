"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export function QuickChatWidget() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/chat")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push("/chat")}
      style={{
        background: "linear-gradient(135deg, var(--accent) 0%, #C94008 100%)",
        borderRadius: 20,
        padding: "28px 32px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--tier-2)",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Wave decorations */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -10,
          bottom: -10,
          opacity: 0.12,
          pointerEvents: "none",
        }}
        width="220"
        height="140"
        viewBox="0 0 220 140"
        fill="none"
      >
        <path
          d="M0 40 Q55 5 110 40 Q165 75 220 40"
          stroke="white"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M0 68 Q55 33 110 68 Q165 103 220 68"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M0 96 Q55 61 110 96 Q165 131 220 96"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0 124 Q55 89 110 124 Q165 159 220 124"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MessageSquare size={19} color="white" strokeWidth={2} />
          </div>
          <div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "white",
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Ask the Beach Assistant
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.75)",
                margin: "4px 0 0",
                lineHeight: 1.4,
              }}
            >
              Explore events, artists, and ticket availability
            </p>
          </div>
        </div>

        {/* Fake input */}
        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            borderRadius: 12,
            padding: "11px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(255,255,255,0.22)",
            marginTop: 18,
          }}
        >
          <Sparkles
            size={15}
            color="rgba(255,255,255,0.55)"
            strokeWidth={1.8}
          />
          <span
            style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", flex: 1 }}
          >
            Who is playing this weekend?
          </span>
          <div
            style={{
              background: "rgba(255,255,255,0.22)",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            Chat now
            <ArrowRight size={13} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}
