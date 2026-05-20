"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Mic2,
  Ticket,
  MessageSquare,
} from "lucide-react";

const T = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  surface3: "var(--surface-3)",
  border: "var(--border)",
  borderStrong: "var(--border-strong)",
  text: "var(--text)",
  text2: "var(--text-2)",
  text3: "var(--text-3)",
  text4: "var(--text-4)",
  accent: "var(--accent)",
  accentTint: "var(--accent-tint)",
  accentTint2: "var(--accent-tint-2)",
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Events",    href: "/events",  icon: Calendar },
  { label: "Singers",   href: "/singers", icon: Mic2 },
  { label: "Tickets",   href: "/tickets", icon: Ticket },
  { label: "Chat",      href: "/chat",    icon: MessageSquare },
];

function WaveLogo() {
  return (
    <svg
      width="28"
      height="20"
      viewBox="0 0 28 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 16 C6 10, 10 6, 14 8 C18 10, 22 14, 26 10"
        stroke={T.accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 12 C6 6, 10 2, 14 4 C18 6, 22 10, 26 6"
        stroke={T.accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M2 8 C6 2, 10 -2, 14 0 C18 2, 22 6, 26 2"
        stroke={T.accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 16px",
        borderRadius: "10px",
        margin: "2px 8px",
        color: active ? T.accent : T.text3,
        background: active ? T.accentTint2 : "transparent",
        borderLeft: active ? `3px solid ${T.accent}` : "3px solid transparent",
        fontWeight: active ? 600 : 500,
        fontSize: "14px",
        textDecoration: "none",
        transition: "background 0.15s ease, color 0.15s ease",
        position: "relative",
      }}
      className="sidebar-nav-item"
    >
      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <style>{`
        .sidebar-nav-item:hover {
          background: var(--surface-3) !important;
          color: var(--text-2) !important;
        }
        .sidebar-nav-item[data-active="true"]:hover {
          background: var(--accent-tint-2) !important;
          color: var(--accent) !important;
        }
      `}</style>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "240px",
          height: "100vh",
          background: T.surface2,
          borderRight: `1px solid ${T.border}`,
          zIndex: 40,
          flexDirection: "column",
          overflow: "hidden",
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <WaveLogo />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: T.text,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Paradise Beach
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: T.text4,
                  fontWeight: 500,
                  marginTop: "2px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Beach Venue
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: "12px", paddingBottom: "8px" }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>🌊</span>
          <span
            style={{
              fontSize: "11px",
              color: T.text4,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            v1.0
          </span>
        </div>
      </motion.aside>
    </>
  );
}
