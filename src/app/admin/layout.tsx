"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Music,
  Calendar,
  Ticket,
  ChevronLeft,
  Menu,
  RefreshCw,
} from "lucide-react";
import { resetStore } from "@/lib/admin-store";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Singers", href: "/admin/singers", icon: Music, exact: false },
  { label: "Events", href: "/admin/events", icon: Calendar, exact: false },
  { label: "Tickets", href: "/admin/tickets", icon: Ticket, exact: false },
] as const;

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100%",
        background: "var(--surface-2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "1.25rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}
        >
          Paradise{" "}
          <span style={{ color: "var(--accent)" }}>·</span>{" "}
          Admin
        </span>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        {NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--accent)" : "var(--text-2)",
                background: active ? "var(--accent-tint)" : "transparent",
                textDecoration: "none",
                transition: "background 0.12s",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: "0.75rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <button
          onClick={() => {
            if (confirm("Reset all data to defaults? This cannot be undone.")) {
              resetStore();
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.625rem 0.75rem",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-3)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <RefreshCw size={15} />
          Reset Data
        </button>

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.625rem 0.75rem",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-3)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={15} />
          Back to app
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ flexShrink: 0, height: "100vh", overflowY: "auto" }}>
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 50,
          }}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 51,
          transform: drawerOpen ? "translateX(0)" : "translateX(-220px)",
          transition: "transform 0.22s ease",
        }}
      >
        <SidebarContent onNav={() => setDrawerOpen(false)} />
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        <header
          className="md:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={20} />
          </button>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Paradise <span style={{ color: "var(--accent)" }}>·</span> Admin
          </span>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
