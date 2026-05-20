# Agent 09b — Chat page: sidebar + memory components (APPEND)

## Context
Project: Paradise Beach — `/home/ouss/Desktop/Coding/paradise`
Agent 09a already created `src/app/chat/page.tsx` with the top section.

## Your job
Read the current `src/app/chat/page.tsx` (to confirm it exists), then **append** the following block to the end of that file using the Edit tool (add after the last `}`).

Do NOT rewrite the whole file. Do NOT run builds. Just append.

---

## Append exactly this content

```tsx

/* ─── topbar ─── */

function TopBar({
  title, hasMessages, loading, memoryCount, memoryDrawerOpen, onToggleMemoryDrawer, historyOpen, onToggleHistory,
}: {
  title: string; hasMessages: boolean; loading: boolean;
  memoryCount: number; memoryDrawerOpen: boolean;
  onToggleMemoryDrawer: () => void; historyOpen: boolean; onToggleHistory: () => void;
}) {
  return (
    <header className="agent-topbar" style={{
      minHeight: 64, background: "var(--surface)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: "clamp(0.5rem, 1.5vw, 0.75rem)",
      padding: "0.5rem clamp(0.85rem, 2.5vw, 1.5rem)", flexShrink: 0,
      position: "sticky", top: 0, zIndex: 30,
    }}>
      <div className="agent-topbar-title" aria-live="polite" style={{
        flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.45rem",
        opacity: hasMessages ? 1 : 0, transition: "opacity 0.18s ease",
      }}>
        <span aria-hidden="true" style={{
          width: 6, height: 6, borderRadius: "50%",
          background: loading ? "var(--accent)" : "var(--text-4)",
          boxShadow: loading ? "0 0 0 4px var(--accent-tint-2)" : "none",
          transition: "background 0.2s, box-shadow 0.2s", flexShrink: 0,
          animation: loading ? "agent-pulse 1.4s ease-in-out infinite" : "none",
        }} />
        <span title={title} style={{
          fontSize: "clamp(0.82rem, 2vw, 0.92rem)", fontWeight: 600, color: "var(--text)",
          letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap", minWidth: 0,
        }}>{title}</span>
      </div>
      <div className="agent-topbar-actions" style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>
        <MemoryButton count={memoryCount} open={memoryDrawerOpen} onToggle={onToggleMemoryDrawer} />
        <button
          type="button" onClick={onToggleHistory}
          aria-label={historyOpen ? "Close history" : "Open history"}
          aria-expanded={historyOpen}
          className="agent-icon-btn agent-topbar-history-toggle"
          style={{
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
            boxShadow: "var(--tier-1)", color: "var(--text)", cursor: "pointer", flexShrink: 0,
            transition: "background 0.15s, border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          {historyOpen ? <PanelRightClose size={18} strokeWidth={2.25} aria-hidden="true" /> : <PanelRightOpen size={18} strokeWidth={2.25} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}

function MemoryButton({ count, open, onToggle }: { count: number; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button" onClick={onToggle}
      aria-label={open ? "Close memories" : "Open memories"}
      aria-expanded={open} title="Agent memories"
      className="agent-memory-trigger"
      style={{
        height: 40, display: "inline-flex", alignItems: "center", gap: "0.45rem",
        padding: "0 0.85rem 0 0.7rem",
        background: open ? T.accentTint2 : T.surface,
        color: open ? T.accent : T.text2,
        border: "1px solid", borderColor: open ? T.accentTint : "var(--border)",
        borderRadius: 100, fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600,
        letterSpacing: "-0.005em", cursor: "pointer", boxShadow: T.tier1,
        transition: "transform 0.18s ease, background 0.18s ease, color 0.18s ease", flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (!open) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <Brain size={15} strokeWidth={2.25} aria-hidden="true" />
      <span className="agent-memory-trigger-label">Memories</span>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 18, height: 18, padding: "0 0.32rem",
        background: count > 0 ? (open ? T.accent : T.accentTint) : T.surface3,
        color: count > 0 ? (open ? "#FFFFFF" : T.accent) : T.text4,
        borderRadius: 100, fontSize: "0.62rem", fontWeight: 700,
        fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: 0,
        transition: "background 0.18s, color 0.18s",
      }}>{count}</span>
    </button>
  );
}

/* ─── sidebar ─── */

function Sidebar({
  open, collapsed, onToggle, conversations, activeId, onSelect, onNew, onDelete, onCloseMobile,
}: {
  open: boolean; collapsed: boolean; onToggle: () => void;
  conversations: Conversation[]; activeId: string;
  onSelect: (id: string) => void; onNew: () => void;
  onDelete: (id: string) => void; onCloseMobile: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredConvs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  return (
    <aside
      className="agent-sidebar"
      aria-label="Conversation history"
      aria-hidden={!open}
      data-open={open ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        width: collapsed ? 56 : "var(--agent-sidebar-w, 288px)",
        background: "var(--surface-2)", borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
        transition: "width 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease",
      }}
    >
      <SidebarSlimRail onExpand={onToggle} onNew={onNew} conversationCount={conversations.length} />

      <div className="agent-sidebar-content" style={{ width: "var(--agent-sidebar-w, 288px)", display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="agent-sidebar-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 0.5rem 0" }}>
          <button
            type="button" onClick={onToggle}
            aria-label="Collapse panel" title="Collapse panel"
            style={{
              width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
              boxShadow: "var(--tier-1)", color: "var(--text)", cursor: "pointer", flexShrink: 0,
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <PanelRightClose size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <span style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--text-4)",
            flex: 1, textAlign: "right", paddingRight: "0.25rem",
          }}>History</span>
        </div>

        <div style={{ padding: "0.5rem 0.5rem 0.55rem" }}>
          <button
            onClick={() => {
              onNew();
              if (typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches) onCloseMobile();
            }}
            className="agent-conv-cta"
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "0.4rem", padding: "0.55rem 0.8rem",
              background: "var(--accent)", color: "#FFFFFF", border: "none", borderRadius: 10,
              fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "-0.005em",
              cursor: "pointer", boxShadow: "0 10px 24px -12px rgba(232,88,12,0.45)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 14px 30px -12px rgba(232,88,12,0.55)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 24px -12px rgba(232,88,12,0.45)"; }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
              <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={12} strokeWidth={2.5} />
              </span>
              New conversation
            </span>
            <ChevronRight size={12} strokeWidth={2.25} style={{ opacity: 0.7 }} />
          </button>
        </div>

        <div style={{ padding: "0.1rem 0.5rem 0.65rem" }}>
          <div className="agent-conv-search" style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--surface)", borderRadius: 10, boxShadow: "var(--tier-1)" }}>
            <Search size={12} strokeWidth={2.25} color="var(--text-4)" style={{ position: "absolute", left: 10, pointerEvents: "none" }} />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              style={{ width: "100%", padding: "0.5rem 0.6rem 0.5rem 1.95rem", background: "transparent", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: "0.8rem", color: "var(--text)", outline: "none" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} aria-label="Clear search" style={{ position: "absolute", right: 4, width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", borderRadius: 6 }}>
                <X size={11} strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-mono), ui-monospace, monospace", fontSize: "clamp(0.6rem, 1.7vw, 0.66rem)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-4)", padding: "0.3rem 0.7rem 0.5rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <span>Conversations</span>
          {searchQuery ? (
            <span style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" }}>· {filteredConvs.length}/{conversations.length}</span>
          ) : (
            <span style={{ color: "var(--text-3)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>· {conversations.length}</span>
          )}
        </div>

        <div className="agent-scroll agent-conv-list" style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: "0 0.5rem 0.5rem", display: "flex", flexDirection: "column", gap: 1 }}>
          {filteredConvs.length === 0 ? (
            <div style={{ padding: "0.85rem 0.9rem", fontSize: "0.78rem", color: "var(--text-4)", textAlign: "center" }}>No conversations match.</div>
          ) : (
            filteredConvs.map((c) => (
              <ConvRow
                key={c.id} conv={c} active={c.id === activeId}
                onSelect={() => { onSelect(c.id); if (window.matchMedia("(max-width: 820px)").matches) onCloseMobile(); }}
                onDelete={() => onDelete(c.id)}
              />
            ))
          )}
        </div>

        <UsageFooter />
      </div>
    </aside>
  );
}

function SidebarSlimRail({ onExpand, onNew, conversationCount }: { onExpand: () => void; onNew: () => void; conversationCount: number }) {
  return (
    <div className="agent-sidebar-rail" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56, height: "100%", padding: "0.75rem 0", gap: "0.45rem" }}>
      <SlimRailButton Icon={PanelRightOpen} label="Expand panel" onClick={onExpand} variant="panel" iconSize={18} />
      <span aria-hidden="true" style={{ width: 28, height: 1, background: "var(--border)", margin: "0.15rem 0" }} />
      <SlimRailButton Icon={Plus} label="New conversation" onClick={onNew} variant="accent" />
      <div style={{ height: "0.3rem" }} />
      <SlimRailButton Icon={MessageSquare} label={`Conversations · ${conversationCount}`} onClick={onExpand} badge={conversationCount} />
    </div>
  );
}

function SlimRailButton({
  Icon, label, onClick, badge, variant, iconSize = 15,
}: {
  Icon: LucideIcon | ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string; onClick: () => void; badge?: number;
  variant?: "default" | "accent" | "panel"; iconSize?: number;
}) {
  const isAccent = variant === "accent";
  const isPanel = variant === "panel";
  return (
    <button
      type="button" onClick={onClick} aria-label={label} title={label}
      style={{
        position: "relative",
        width: isPanel ? 40 : 36, height: isPanel ? 40 : 36,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: isAccent ? "var(--accent)" : isPanel ? "var(--surface)" : "transparent",
        border: "1px solid",
        borderColor: isAccent ? "var(--accent-2)" : isPanel ? "var(--border)" : "transparent",
        borderRadius: isPanel ? 10 : 9,
        color: isAccent ? "#FFFFFF" : isPanel ? "var(--text)" : "var(--text-3)",
        cursor: "pointer", flexShrink: 0,
        boxShadow: isAccent ? "0 4px 12px -4px rgba(232,88,12,0.45)" : isPanel ? "var(--tier-1)" : "none",
        transition: "background 0.15s, color 0.15s, border-color 0.15s, transform 0.12s",
      }}
      onMouseEnter={(e) => {
        if (isAccent) return;
        if (isPanel) { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border-strong)"; return; }
        e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        if (isAccent) return;
        if (isPanel) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; return; }
        e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "var(--text-3)";
      }}
    >
      <Icon size={iconSize} strokeWidth={2.25} />
      {badge !== undefined && badge > 0 && !isAccent && (
        <span aria-hidden="true" style={{ position: "absolute", top: -3, right: -3, minWidth: 14, height: 14, padding: "0 3px", background: "var(--accent)", color: "#FFFFFF", border: "2px solid var(--surface-2)", borderRadius: 999, fontSize: "0.55rem", fontWeight: 700, fontFamily: "var(--font-mono), ui-monospace, monospace", fontVariantNumeric: "tabular-nums", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

function ConvRow({ conv, active, onSelect, onDelete }: { conv: Conversation; active: boolean; onSelect: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  const lastTs = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].ts ?? conv.createdAt : conv.createdAt;
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={`agent-conv-row${active ? " is-active" : ""}`}
      style={{ position: "relative", display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", gap: "0.55rem", padding: "0.45rem 0.55rem", background: active ? "var(--surface)" : hover ? "var(--surface-3)" : "transparent", borderRadius: 8, cursor: "pointer", transition: "background 0.15s ease" }}
      onClick={onSelect} role="button" tabIndex={0} aria-current={active ? "true" : undefined}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
    >
      <MessageSquare size={13} strokeWidth={2} color={active ? "var(--accent)" : "var(--text-3)"} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span style={{ fontSize: "0.82rem", color: active ? "var(--text)" : "var(--text-2)", fontWeight: active ? 600 : 500, letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{conv.title}</span>
      <span style={{ position: "relative", width: 32, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
        <span aria-hidden="true" style={{ fontSize: "0.66rem", fontFamily: "var(--font-mono), ui-monospace, monospace", color: "var(--text-4)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", opacity: hover ? 0 : active ? 0.9 : 0.7, transition: "opacity 0.15s ease", pointerEvents: "none" }}>{relTime(lastTs)}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete conversation" tabIndex={hover ? 0 : -1}
          style={{ position: "absolute", right: 0, top: 0, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "var(--text-4)", cursor: "pointer", borderRadius: 5, opacity: hover ? 1 : 0, pointerEvents: hover ? "auto" : "none", transition: "opacity 0.15s ease, background 0.12s, color 0.12s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--danger)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-4)"; }}
        >
          <Trash2 size={11} strokeWidth={2} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

function UsageFooter() {
  const used = 47; const cap = 500;
  const pct = Math.min(100, (used / cap) * 100);
  return (
    <div style={{ padding: "0.75rem 0.85rem calc(0.9rem + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: "0.55rem", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0.6rem 0.7rem 0.65rem", background: "var(--surface)", borderRadius: 9, boxShadow: "var(--tier-1)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-mono), ui-monospace, monospace", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)" }}>Queries this month</span>
          <span style={{ fontFamily: "var(--font-mono), ui-monospace, monospace", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: "var(--accent)" }}>{used}</span>
            <span style={{ color: "var(--text-4)" }}> / {cap}</span>
          </span>
        </div>
        <div aria-hidden="true" style={{ position: "relative", height: 4, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <span style={{ position: "absolute", inset: "0 auto 0 0", width: `${pct}%`, background: "var(--accent)", borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.7rem", background: "var(--surface)", borderRadius: 9, boxShadow: "var(--tier-1)", minWidth: 0 }}>
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 0 3px var(--success-tint)", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.2 }}>
          <span style={{ fontFamily: "var(--font-mono), ui-monospace, monospace", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)" }}>Data synced</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-2)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Events · live · Tickets · live</span>
        </div>
      </div>
    </div>
  );
}
```

Stop here. Agent 09c will append the rest.
