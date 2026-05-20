"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo, type ComponentType, type FormEvent, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
  Calendar,
  TrendingUp,
  Ticket,
  Mic2,
  Users,
  ChevronDown,
  ChevronRight,
  Wrench,
  CircleCheck,
  CircleAlert,
  PanelRightClose,
  PanelRightOpen,
  BookmarkPlus,
  Bookmark,
  Eye,
  StickyNote,
  Settings2,
  X,
  Pencil,
  Copy,
  Check,
  Search,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { Markdown } from "./markdown";
import type { Memory, MemoryInput, MemoryKind } from "@/agent/memory/types";
import { getMemoryStore } from "@/agent/memory/store";
import {
  useAgentConversation,
  type Conversation,
  type Message,
  type ToolCall,
  type ToolResult,
} from "@/components/dashboard/AgentConversationProvider";

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
  accent2: "var(--accent-2)",
  accentTint: "var(--accent-tint)",
  accentTint2: "var(--accent-tint-2)",
  success: "var(--success)",
  successTint: "var(--success-tint)",
  warn: "var(--warn)",
  warnTint: "var(--warn-tint)",
  danger: "var(--danger)",
  dangerTint: "var(--danger-tint)",
  info: "var(--info)",
  infoTint: "var(--info-tint)",
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
  gradient: "linear-gradient(135deg, #E8580C 0%, #C94008 100%)",
  gradientShadow:
    "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(201,64,8,0.35), 0 4px 14px -4px rgba(232,88,12,0.45)",
  gradientShadowHover:
    "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(201,64,8,0.35), 0 8px 20px -4px rgba(232,88,12,0.55)",
};

const actionPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.25rem 0.55rem",
  background: T.surface,
  border: "none",
  borderRadius: 7,
  fontFamily: "inherit",
  fontSize: "0.68rem",
  fontWeight: 600,
  color: T.text3,
  cursor: "pointer",
  textTransform: "none",
  letterSpacing: 0,
  boxShadow: T.tier1,
  transition: "color 0.15s, transform 0.18s ease",
};

function actionPillHoverIn(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = T.accent;
  e.currentTarget.style.transform = "translateY(-1px)";
}
function actionPillHoverOut(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = T.text3;
  e.currentTarget.style.transform = "translateY(0)";
}

const SUGGESTIONS: { title: string; hint: string; prompt: string; Icon: typeof Sparkles }[] = [
  { title: "This weekend's lineup", hint: "Artists performing soon",      prompt: "Who is playing this weekend?",                                        Icon: Calendar   },
  { title: "VIP availability",      hint: "Check remaining tickets",      prompt: "How many VIP tickets are left for each upcoming event?",              Icon: Ticket     },
  { title: "Reggae artists",        hint: "Summer performers",            prompt: "Show me all reggae artists performing this summer",                   Icon: Mic2       },
  { title: "Revenue forecast",      hint: "Ticket sales projection",      prompt: "What's the total revenue if all remaining General tickets sell out?", Icon: TrendingUp },
  { title: "Headliners in July",    hint: "Top billing events",           prompt: "Which artists are headlining events in July 2026?",                  Icon: Users      },
  { title: "Tonight's vibe",        hint: "Next event summary",           prompt: "Give me a full summary of the next event",                           Icon: Sparkles   },
];

const SIDEBAR_STATE_KEY = "paradise.chat.sidebar.v1";
const SIDEBAR_COLLAPSED_KEY = "paradise.chat.sidebar-collapsed.v1";
const SIDEBAR_BREAKPOINT = 820;

function toolLabel(name: string): string {
  return name.replace(/_/g, " ");
}

function deriveTitle(msg: string): string {
  const t = msg.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 46) + "…" : t;
}

function fmt(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}

function relTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} d`;
  return new Date(ts).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
}

export default function AgentTestPage() {
  const {
    conversations,
    activeId,
    active,
    loading,
    error,
    activeTool,
    setActive: setActiveId,
    newConversation: providerNewConversation,
    deleteConversation,
    send: providerSend,
    stop,
    editUserMessage: providerEditUserMessage,
    clearError,
  } = useAgentConversation();

  const [input, setInput] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const displayedError = voiceError ?? error;
  const clearDisplayedError = useCallback(() => {
    setVoiceError(null);
    clearError();
  }, [clearError]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoryDraft, setMemoryDraft] = useState<MemoryInput | null>(null);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const memoryStoreRef = useRef(getMemoryStore());

  useEffect(() => {
    document.title = "Chat — Paradise Beach";
  }, []);

  useEffect(() => {
    const mobile = window.innerWidth < SIDEBAR_BREAKPOINT;
    setIsMobileLayout(mobile);
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      if (stored === "open") setSidebarOpen(true);
      else if (stored === "closed") setSidebarOpen(false);
      else setSidebarOpen(!mobile);
    } catch {
      setSidebarOpen(!mobile);
    }
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === "true") setSidebarCollapsed(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(SIDEBAR_STATE_KEY, sidebarOpen ? "open" : "closed"); } catch {}
  }, [sidebarOpen, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed, hydrated]);

  const toggleSidebar = useCallback(() => {
    if (isMobileLayout) setSidebarOpen((v) => !v);
    else setSidebarCollapsed((v) => !v);
  }, [isMobileLayout]);

  useEffect(() => {
    if (!sidebarOpen || !isMobileLayout) return;
    document.documentElement.classList.add("scroll-locked");
    return () => { document.documentElement.classList.remove("scroll-locked"); };
  }, [sidebarOpen, isMobileLayout]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_BREAKPOINT - 1}px)`);
    const sync = (e: MediaQueryListEvent | MediaQueryList) => setIsMobileLayout(e.matches);
    sync(mql);
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    memoryStoreRef.current.list().then(setMemories).catch(() => setMemories([]));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!showScrollBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active.messages, loading, showScrollBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBottom(distance > 120);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeId]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 340) + "px";
  }, [input]);

  const refreshMemories = useCallback(async () => {
    try { setMemories(await memoryStoreRef.current.list()); } catch {}
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    await providerSend(trimmed, { memories });
    await refreshMemories();
  }, [loading, providerSend, memories, refreshMemories]);

  const sendRef = useRef<(text: string) => Promise<void>>(async () => {});
  useEffect(() => { sendRef.current = send; }, [send]);

  const editUserMessage = useCallback((idx: number, newText: string) => {
    const msg = active.messages[idx];
    if (!msg || msg.role !== "user" || !msg.id) return;
    const trimmed = newText.trim();
    if (!trimmed) return;
    providerEditUserMessage(msg.id);
    setTimeout(() => { void send(trimmed); }, 0);
  }, [active.messages, providerEditUserMessage, send]);

  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const newConversation = useCallback(() => {
    providerNewConversation();
    setInput("");
  }, [providerNewConversation]);

  const saveMemoryFromUi = useCallback(async (input: MemoryInput) => {
    const m = await memoryStoreRef.current.save(input);
    setMemories((prev) => [...prev, m]);
    setMemoryDraft(null);
    setEditingMemoryId(null);
  }, []);

  const updateMemoryFromUi = useCallback(async (id: string, patch: MemoryInput) => {
    const m = await memoryStoreRef.current.update(id, patch);
    setMemories((prev) => prev.map((x) => (x.id === id ? m : x)));
    setMemoryDraft(null);
    setEditingMemoryId(null);
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    await memoryStoreRef.current.remove(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const openMemoryForEdit = useCallback((m: Memory) => {
    setEditingMemoryId(m.id);
    setMemoryDraft({ kind: m.kind, name: m.name, body: m.body, target: m.target });
  }, []);

  const closeMemoryDialog = useCallback(() => {
    setMemoryDraft(null);
    setEditingMemoryId(null);
  }, []);

  const replaySavedView = useCallback((m: Memory) => {
    providerNewConversation();
    setInput("");
    setTimeout(() => sendRef.current(m.body), 0);
  }, [providerNewConversation]);

  const memoryCounts = useMemo(() => {
    const c = { preference: 0, watch: 0, "saved-view": 0, note: 0 } as Record<MemoryKind, number>;
    for (const m of memories) c[m.kind] = (c[m.kind] ?? 0) + 1;
    return c;
  }, [memories]);

  return (
    <div
      className="agent-root"
      style={{
        minHeight: "100vh",
        height: "100dvh",
        background: "var(--surface-2)",
        color: "var(--text)",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        display: "flex",
        overflow: "hidden",
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      <div
        className="agent-column"
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, background: "var(--bg)" }}
      >
        <TopBar
          title={active.title}
          hasMessages={active.messages.length > 0}
          loading={loading}
          memoryCount={memories.length}
          memoryDrawerOpen={memoryDrawerOpen}
          onToggleMemoryDrawer={() => setMemoryDrawerOpen((v) => !v)}
          historyOpen={isMobileLayout ? sidebarOpen : !sidebarCollapsed}
          onToggleHistory={toggleSidebar}
        />

        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, background: "var(--bg)", position: "relative" }}>
          <div
            ref={scrollRef}
            className="agent-scroll"
            style={{ flex: 1, overflowY: "auto", padding: "clamp(1rem, 3vw, 2.25rem) clamp(0.85rem, 3vw, 2.25rem)" }}
          >
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {active.messages.length === 0 && !loading ? (
                <Welcome onPick={send} loading={loading} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(1.2rem, 2.8vw, 1.6rem)" }}>
                  <AnimatePresence initial={false}>
                    {active.messages.map((m, i) => (
                      <MessageBubble
                        key={`${activeId}-${i}`}
                        message={m}
                        onMemorise={
                          m.role === "assistant"
                            ? () => setMemoryDraft({ kind: "note", name: deriveTitle(m.content).replace(/…$/, ""), body: m.content.replace(/\s+/g, " ").trim().slice(0, 240) })
                            : undefined
                        }
                        onEdit={m.role === "user" && !loading ? (newText: string) => editUserMessage(i, newText) : undefined}
                      />
                    ))}
                  </AnimatePresence>
                  {loading && active.messages[active.messages.length - 1]?.role !== "assistant" && (
                    <ThinkingIndicator activeTool={activeTool} />
                  )}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showScrollBottom && (
              <motion.button
                key="scroll-to-bottom"
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.92 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => { const el = scrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }}
                aria-label="Scroll to latest message"
                title="Scroll to latest message"
                style={{
                  position: "absolute",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
                  right: "clamp(1rem, 3vw, 2rem)",
                  width: 36, height: 36,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: T.surface, color: T.text2, border: "none", borderRadius: "50%",
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 6px 18px -6px rgba(0,0,0,0.20)",
                  zIndex: 20, transition: "transform 0.18s ease, color 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.color = T.text2; }}
              >
                <ChevronDown size={16} strokeWidth={2.25} aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>

          <Composer
            value={input}
            onChange={setInput}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            onStop={stop}
            loading={loading}
            error={displayedError}
            onClearError={clearDisplayedError}
            textareaRef={textareaRef}
            memoryCounts={memoryCounts}
          />
        </main>
      </div>

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={newConversation}
        onDelete={deleteConversation}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <AnimatePresence>
        {memoryDrawerOpen && (
          <MemoryDrawer
            key="memory-drawer"
            memories={memories}
            isMobile={isMobileLayout}
            onClose={() => setMemoryDrawerOpen(false)}
            onReplaySavedView={(m) => { setMemoryDrawerOpen(false); replaySavedView(m); }}
            onDeleteMemory={deleteMemory}
            onOpenMemory={(m) => { openMemoryForEdit(m); }}
            onNewMemory={() => { setEditingMemoryId(null); setMemoryDraft({ kind: "preference", name: "", body: "" }); }}
          />
        )}
        {memoryDraft && (
          <MemoryDialog
            draft={memoryDraft}
            editingId={editingMemoryId}
            onChange={setMemoryDraft}
            onClose={closeMemoryDialog}
            onSubmit={saveMemoryFromUi}
            onUpdate={updateMemoryFromUi}
            onDelete={(id) => { void deleteMemory(id); closeMemoryDialog(); }}
            onReplay={(m) => { closeMemoryDialog(); replaySavedView(m); }}
            currentMemory={editingMemoryId ? memories.find((m) => m.id === editingMemoryId) ?? null : null}
          />
        )}
        {sidebarOpen && isMobileLayout && (
          <motion.div
            key="sidebar-scrim"
            className="agent-sidebar-scrim"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <style>{`
        :root, .agent-root { --agent-sidebar-w: 288px; }
        @media (max-width: 1100px) { .agent-root { --agent-sidebar-w: 256px; } }
        @media (max-width: 820px)  { .agent-root { --agent-sidebar-w: min(86vw, 320px); } }

        .agent-sidebar-scrim { display: none; }
        @media (max-width: 820px) {
          .agent-sidebar {
            position: fixed !important; top: 0; bottom: 0; right: 0; z-index: 50;
            box-shadow: -8px 0 32px rgba(0,0,0,0.16);
            width: var(--agent-sidebar-w, 320px) !important;
            transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.26s ease !important;
          }
          .agent-sidebar[data-open="false"] { transform: translateX(100%); box-shadow: none; pointer-events: none; }
          .agent-sidebar[data-open="true"]  { transform: translateX(0); }
          .agent-sidebar-scrim {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.32); backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px); z-index: 49;
          }
          .agent-sidebar-rail    { display: none !important; }
          .agent-sidebar-content { display: flex !important; }
        }
        @media (min-width: 821px) {
          .agent-sidebar[data-collapsed="true"]  .agent-sidebar-content { display: none !important; }
          .agent-sidebar[data-collapsed="false"] .agent-sidebar-rail    { display: none !important; }
          .agent-topbar-history-toggle { display: none !important; }
        }
        @media (max-width: 600px) { .agent-memory-trigger-label { display: none !important; } }
        @media (max-width: 820px) {
          .agent-column { padding-top: 4.5rem; }
          .agent-topbar { position: static !important; z-index: auto !important; padding-right: clamp(0.85rem, 2.5vw, 1.5rem); }
          .agent-topbar-actions { position: fixed !important; top: 0.75rem; right: 0.75rem; z-index: 46; }
        }
        .agent-composer { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
        .agent-composer:focus-within {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-tint), 0 1px 2px rgba(0,0,0,0.03), 0 8px 24px -10px rgba(0,0,0,0.08), 0 20px 48px -24px rgba(0,0,0,0.10);
        }
        textarea.agent-input::placeholder { color: ${T.text4}; }
        textarea.agent-input:disabled { cursor: not-allowed; opacity: 0.6; }
        textarea.agent-input::-webkit-scrollbar { display: none; }
        @media (max-width: 600px) { .agent-composer-hint { font-size: 0.66rem; } .agent-composer-hint kbd { display: none; } }
        @media (max-width: 900px) { .agent-welcome-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .agent-welcome-grid { grid-template-columns: 1fr !important; } .agent-scroll [data-user-bubble] { max-width: 88% !important; } }
        .agent-root :focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; border-radius: inherit; }
        .agent-root .agent-input:focus-visible { outline: none; }
        .agent-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .agent-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
        .agent-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.18); background-clip: content-box; border: 2px solid transparent; }
        .agent-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes agent-pulse {
          0%, 100% { box-shadow: 0 0 0 4px var(--accent-tint-2); }
          50%       { box-shadow: 0 0 0 6px rgba(232,88,12,0.04); }
        }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; } }
      `}</style>
    </div>
  );
}

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
