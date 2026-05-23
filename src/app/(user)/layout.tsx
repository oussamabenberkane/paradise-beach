"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { ArrowUpRight } from "lucide-react";
import "./sunsetstrip.css";
import "./sunsetstrip-v2.css";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="ss-root" style={{ minHeight: "100vh" }}>
      <UserTopBar />
      {children}
    </div>
  );
}

function UserTopBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) return null;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 70,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        padding: "0.85rem clamp(1.25rem, 4vw, 3rem)",
        gap: "1rem",
        background: "rgba(22, 11, 31, 0.82)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid var(--ss-border)",
        color: "var(--ss-ink)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.55rem",
          fontWeight: 600,
          fontSize: "0.88rem",
          letterSpacing: "0.02em",
          textDecoration: "none",
          color: "var(--ss-ink)",
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFF6CC 0%, var(--ss-neon) 70%)",
            boxShadow: "0 0 14px var(--ss-neon)",
            flexShrink: 0,
          }}
        />
        paradise beach
      </Link>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <NavLink href="/events">Events</NavLink>
        <NavLink href="/singers">Artists</NavLink>
        <NavLink href="/my-tickets">My Tickets</NavLink>
        <NavLink href="/chat">Chat</NavLink>
        <Link
          href="/chat"
          className="ss-sticky-cta"
          style={{ marginLeft: "0.5rem" }}
        >
          ASK THE STRIP
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </Link>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link href={href} className={`ss-sticky-pill${active ? " is-active" : ""}`}>
      {children}
    </Link>
  );
}
