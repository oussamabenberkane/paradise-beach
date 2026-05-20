# Agent 09a — Chat page: top section (CREATE FILE)

## Your only job
Create `/home/ouss/Desktop/Coding/paradise/src/app/chat/page.tsx` with the content below.
Write the file using the Write tool. Do NOT run builds. Do NOT read any other files.

---

## Write exactly this content (top of file through end of page component)

```tsx
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
```

Stop here. The next agent (09b) will append the rest of the components.
