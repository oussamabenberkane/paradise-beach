"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const T = {
  bg: "var(--bg)",
};

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="p-4 pb-20 md:ml-60 md:p-6 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <TopBar />
    </div>
  );
}
