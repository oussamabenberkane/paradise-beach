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

/* ─── welcome ─── */

function Welcome({ onPick, loading }: { onPick: (text: string) => void; loading: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "clamp(2rem, 8vw, 5rem)", paddingBottom: "2rem", gap: "clamp(1.5rem, 4vw, 2.5rem)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: T.gradient, boxShadow: T.gradientShadow, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <Sparkles size={24} color="#fff" />
        </div>
        <h2 style={{ margin: 0, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>
          How can I help?
        </h2>
        <p style={{ margin: "0.4rem 0 0", fontSize: "clamp(0.82rem, 2vw, 0.92rem)", color: T.text3 }}>
          Ask anything about events, artists, or tickets.
        </p>
      </div>
      <div className="agent-welcome-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.65rem", width: "100%", maxWidth: 560 }}>
        {SUGGESTIONS.map(({ title, hint, prompt, Icon }) => (
          <button
            key={prompt}
            type="button"
            disabled={loading}
            onClick={() => onPick(prompt)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.25rem",
              padding: "0.85rem 1rem", background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", textAlign: "left",
              boxShadow: T.tier1, transition: "border-color 0.15s, box-shadow 0.15s",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = T.tier2 ?? T.tier1; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = T.tier1; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Icon size={14} color={T.accent} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: T.text }}>{title}</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: T.text3 }}>{hint}</span>
          </button>
        ))}
      </div>
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

/* ─── message bubble ─── */

function MessageBubble({
  message,
  onMemorise,
  onEdit,
}: {
  message: Message;
  onMemorise?: () => void;
  onEdit?: (newText: string) => void;
}) {
  const isUser = message.role === "user";
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [editing]);

  function commitEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.content && onEdit) onEdit(trimmed);
    setEditing(false);
  }

  function copy() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const hasTool = (message.toolCalls?.length ?? 0) > 0 || (message.toolResults?.length ?? 0) > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setActionsVisible(true)}
      onMouseLeave={() => setActionsVisible(false)}
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: isUser ? "flex-end" : "flex-start" }}
    >
      {hasTool && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", width: "100%", maxWidth: 560 }}>
          {message.toolCalls?.map((tc, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "0.45rem",
              padding: "0.4rem 0.7rem", background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 9, boxShadow: T.tier1,
            }}>
              <Wrench size={12} color={T.text3} />
              <span style={{ fontSize: "0.75rem", color: T.text3, fontWeight: 500 }}>{toolLabel(tc.toolName)}</span>
            </div>
          ))}
          {message.toolResults?.map((tr, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "0.45rem",
              padding: "0.4rem 0.7rem", background: T.successTint, border: `1px solid ${T.success}22`,
              borderRadius: 9,
            }}>
              <CircleCheck size={12} color={T.success} />
              <span style={{ fontSize: "0.75rem", color: T.text3, fontWeight: 500 }}>{toolLabel(tr.toolName)} done</span>
            </div>
          ))}
        </div>
      )}

      {message.content && (
        <div
          data-user-bubble={isUser ? "" : undefined}
          style={{
            position: "relative",
            maxWidth: isUser ? "78%" : "100%",
            padding: isUser ? "0.6rem 0.9rem" : "0.05rem 0",
            background: isUser ? T.gradient : "transparent",
            boxShadow: isUser ? T.gradientShadow : "none",
            borderRadius: isUser ? 16 : 0,
            color: isUser ? "#fff" : T.text,
            fontSize: "clamp(0.875rem, 2vw, 0.9375rem)",
            lineHeight: 1.65,
          }}
        >
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); }
                  if (e.key === "Escape") setEditing(false);
                }}
                style={{
                  width: "100%", minHeight: 80, resize: "vertical", padding: "0.5rem 0.7rem",
                  background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10, color: "#fff", fontSize: "inherit", fontFamily: "inherit",
                  lineHeight: 1.6,
                }}
              />
              <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setEditing(false)} style={{ ...actionPillStyle, background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
                <button type="button" onClick={commitEdit} style={{ ...actionPillStyle, background: "rgba(255,255,255,0.18)", color: "#fff" }}>Send</button>
              </div>
            </div>
          ) : (
            isUser ? (
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</span>
            ) : (
              <Markdown source={message.content} />
            )
          )}
        </div>
      )}

      {!editing && (
        <div style={{
          display: "flex", gap: "0.3rem", opacity: actionsVisible ? 1 : 0,
          transition: "opacity 0.15s", pointerEvents: actionsVisible ? "auto" : "none",
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}>
          <button type="button" onClick={copy} title="Copy" style={actionPillStyle}
            onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          {onEdit && (
            <button type="button" onClick={() => { setEditText(message.content); setEditing(true); }} title="Edit" style={actionPillStyle}
              onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}>
              <Pencil size={12} />
            </button>
          )}
          {onMemorise && (
            <button type="button" onClick={onMemorise} title="Save to memory" style={actionPillStyle}
              onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}>
              <BookmarkPlus size={12} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── thinking indicator ─── */

function ThinkingIndicator({ activeTool }: { activeTool: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}
    >
      <div style={{ display: "flex", gap: "0.28rem", alignItems: "center" }}>
        {[0, 0.18, 0.36].map((delay) => (
          <span key={delay} style={{
            width: 7, height: 7, borderRadius: "50%", background: T.accent,
            display: "inline-block",
            animation: `agent-dot-bounce 1.2s ${delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      {activeTool && (
        <span style={{ fontSize: "0.75rem", color: T.text3, fontWeight: 500 }}>
          {toolLabel(activeTool)}…
        </span>
      )}
      <style>{`
        @keyframes agent-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}

/* ─── composer ─── */

function Composer({
  value, onChange, onSubmit, onKeyDown, onStop, loading, error, onClearError, textareaRef, memoryCounts,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onStop: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  memoryCounts: Record<string, number>;
}) {
  const totalMemories = Object.values(memoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      flexShrink: 0, padding: "0.75rem clamp(0.85rem, 3vw, 2.25rem) calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      background: T.bg, borderTop: `1px solid ${T.border}`,
    }}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem", marginBottom: "0.55rem",
            background: T.dangerTint, border: `1px solid ${T.danger}33`,
            borderRadius: 10, fontSize: "0.8rem", color: T.danger,
          }}
        >
          <CircleAlert size={14} />
          <span style={{ flex: 1 }}>{error}</span>
          <button type="button" onClick={onClearError} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger, padding: 0, display: "flex" }}>
            <X size={14} />
          </button>
        </motion.div>
      )}
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: "0.5rem",
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: "0.55rem 0.55rem 0.55rem 0.9rem",
          boxShadow: T.tier1, transition: "border-color 0.15s",
        }}>
          <textarea
            ref={textareaRef}
            className="agent-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about events, artists, or tickets…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, resize: "none", border: "none", background: "transparent",
              fontSize: "clamp(0.875rem, 2vw, 0.9375rem)", lineHeight: 1.6, color: T.text,
              fontFamily: "inherit", minHeight: 28, maxHeight: 340, overflowY: "auto",
              outline: "none", padding: 0,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
            {totalMemories > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.25rem",
                fontSize: "0.7rem", color: T.text3, fontWeight: 600,
                padding: "0.15rem 0.4rem", background: T.accentTint, borderRadius: 6,
              }}>
                <Brain size={10} color={T.accent} />
                {totalMemories}
              </span>
            )}
            {loading ? (
              <button
                type="button" onClick={onStop}
                aria-label="Stop generation"
                style={{
                  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  background: T.dangerTint, border: `1px solid ${T.danger}33`,
                  borderRadius: 10, cursor: "pointer", color: T.danger, flexShrink: 0,
                }}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!value.trim()}
                aria-label="Send message"
                style={{
                  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  background: value.trim() ? T.gradient : T.surface2,
                  boxShadow: value.trim() ? T.gradientShadow : "none",
                  border: value.trim() ? "none" : `1px solid ${T.border}`,
                  borderRadius: 10, cursor: value.trim() ? "pointer" : "not-allowed",
                  color: value.trim() ? "#fff" : T.text3, flexShrink: 0,
                  transition: "background 0.18s, box-shadow 0.18s",
                }}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── memory drawer ─── */

function MemoryDrawer({
  memories, isMobile, onClose, onReplaySavedView, onDeleteMemory, onOpenMemory, onNewMemory,
}: {
  memories: Memory[];
  isMobile: boolean;
  onClose: () => void;
  onReplaySavedView: (m: Memory) => void;
  onDeleteMemory: (id: string) => void;
  onOpenMemory: (m: Memory) => void;
  onNewMemory: () => void;
}) {
  const kindLabel: Record<string, string> = { preference: "Preference", watch: "Watch", "saved-view": "Saved View", note: "Note" };
  const kindIcon: Record<string, React.ReactNode> = {
    preference: <Settings2 size={12} />,
    watch: <Eye size={12} />,
    "saved-view": <Bookmark size={12} />,
    note: <StickyNote size={12} />,
  };

  return (
    <motion.aside
      key="memory-drawer"
      initial={{ x: isMobile ? "100%" : 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? "100%" : 20, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: isMobile ? "min(88vw, 340px)" : 300,
        background: T.surface, borderLeft: `1px solid ${T.border}`,
        boxShadow: "-8px 0 32px -8px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column", zIndex: 60,
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "1rem 1rem 0.75rem", borderBottom: `1px solid ${T.border}`, gap: "0.5rem" }}>
        <Brain size={16} color={T.accent} />
        <span style={{ flex: 1, fontWeight: 700, fontSize: "0.9rem", color: T.text }}>Memory</span>
        <button type="button" onClick={onNewMemory} title="Add memory" style={{ ...actionPillStyle }}>
          <Plus size={12} /> Add
        </button>
        <button type="button" onClick={onClose} aria-label="Close memory drawer" style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, padding: 4, display: "flex" }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        {memories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: T.text4, fontSize: "0.82rem" }}>
            No memories yet. Save something to remember it across chats.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {memories.map((m) => (
              <div key={m.id} style={{
                padding: "0.65rem 0.75rem", background: T.bg, borderRadius: 10,
                border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "0.3rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ color: T.accent }}>{kindIcon[m.kind]}</span>
                  <span style={{ fontSize: "0.68rem", color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{kindLabel[m.kind] ?? m.kind}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: "0.65rem", color: T.text4 }}>{relTime(m.updatedAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: T.text, fontWeight: 600, lineHeight: 1.35 }}>{m.name}</p>
                {m.body && <p style={{ margin: 0, fontSize: "0.75rem", color: T.text3, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.body}</p>}
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.25rem" }}>
                  <button type="button" onClick={() => onOpenMemory(m)} style={actionPillStyle} onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}><Pencil size={10} /> Edit</button>
                  {m.kind === "saved-view" && <button type="button" onClick={() => onReplaySavedView(m)} style={actionPillStyle} onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}><Eye size={10} /> Replay</button>}
                  <button type="button" onClick={() => onDeleteMemory(m.id)} style={{ ...actionPillStyle, marginLeft: "auto" }} onMouseEnter={(e) => { e.currentTarget.style.color = T.danger; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={actionPillHoverOut}><Trash2 size={10} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

/* ─── memory dialog ─── */

function MemoryDialog({
  draft, editingId, onChange, onClose, onSubmit, onUpdate, onDelete, onReplay, currentMemory,
}: {
  draft: MemoryInput | null;
  editingId: string | null;
  onChange: (v: MemoryInput) => void;
  onClose: () => void;
  onSubmit: (input: MemoryInput) => void;
  onUpdate: (id: string, patch: MemoryInput) => void;
  onDelete: (id: string) => void;
  onReplay: (m: Memory) => void;
  currentMemory: Memory | null;
}) {
  if (!draft) return null;
  const isEditing = Boolean(editingId);
  const kinds: MemoryKind[] = ["preference", "watch", "saved-view", "note"];
  const kindLabel: Record<MemoryKind, string> = { preference: "Preference", watch: "Watch", "saved-view": "Saved View", note: "Note" };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft || !draft.name.trim()) return;
    if (isEditing && editingId) onUpdate(editingId, draft);
    else onSubmit(draft);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: "0 24px 64px -12px rgba(0,0,0,0.22)", width: "100%", maxWidth: 440, overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "1rem 1rem 0.75rem", borderBottom: `1px solid ${T.border}` }}>
          <Brain size={16} color={T.accent} />
          <span style={{ flex: 1, fontWeight: 700, fontSize: "0.9rem", color: T.text }}>{isEditing ? "Edit memory" : "Save to memory"}</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, padding: 4, display: "flex" }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {kinds.map((k) => (
              <button
                key={k} type="button"
                onClick={() => onChange({ ...draft, kind: k })}
                style={{
                  ...actionPillStyle,
                  background: draft.kind === k ? T.accentTint : T.surface2,
                  color: draft.kind === k ? T.accent : T.text3,
                  border: draft.kind === k ? `1px solid ${T.accent}33` : "none",
                }}
              >
                {kindLabel[k]}
              </button>
            ))}
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Name"
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            style={{
              padding: "0.55rem 0.75rem", background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, fontSize: "0.875rem", color: T.text, fontFamily: "inherit", outline: "none",
            }}
          />
          <textarea
            placeholder="Details (optional)"
            value={draft.body}
            onChange={(e) => onChange({ ...draft, body: e.target.value })}
            rows={4}
            style={{
              padding: "0.55rem 0.75rem", background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 10, fontSize: "0.875rem", color: T.text, fontFamily: "inherit",
              resize: "vertical", outline: "none", lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {isEditing && editingId && (
                <button type="button" onClick={() => onDelete(editingId)} style={{ ...actionPillStyle, color: T.danger }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.danger; }} onMouseLeave={actionPillHoverOut}>
                  <Trash2 size={12} /> Delete
                </button>
              )}
              {isEditing && currentMemory?.kind === "saved-view" && (
                <button type="button" onClick={() => { onClose(); onReplay(currentMemory); }} style={actionPillStyle}
                  onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}>
                  <Eye size={12} /> Replay
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <button type="button" onClick={onClose} style={actionPillStyle} onMouseEnter={actionPillHoverIn} onMouseLeave={actionPillHoverOut}>Cancel</button>
              <button
                type="submit"
                disabled={!draft.name.trim()}
                style={{
                  ...actionPillStyle,
                  background: draft.name.trim() ? T.gradient : T.surface2,
                  color: draft.name.trim() ? "#fff" : T.text3,
                  boxShadow: draft.name.trim() ? T.gradientShadow : "none",
                  cursor: draft.name.trim() ? "pointer" : "not-allowed",
                }}
              >
                {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
