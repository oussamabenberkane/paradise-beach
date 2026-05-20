"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Mic2,
  Ticket,
  MessageSquare,
} from "lucide-react";

const T = {
  surface: "var(--surface)",
  border: "var(--border)",
  text4: "var(--text-4)",
  accent: "var(--accent)",
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/",        icon: LayoutDashboard },
  { label: "Events",    href: "/events",  icon: Calendar },
  { label: "Singers",   href: "/singers", icon: Mic2 },
  { label: "Tickets",   href: "/tickets", icon: Ticket },
  { label: "Chat",      href: "/chat",    icon: MessageSquare },
];

export function TopBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="flex md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 4px",
              color: active ? T.accent : T.text4,
              textDecoration: "none",
              position: "relative",
              gap: "2px",
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
              />
            </div>

            {/* Active dot indicator */}
            <div style={{ height: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {active && (
                <motion.div
                  layoutId="mobile-tab-dot"
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: T.accent,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </div>

            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
