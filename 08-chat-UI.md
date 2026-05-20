# Agent 08 — Chat UI (continued)

## Status

- ✅ `src/app/chat/markdown.tsx` — beach-themed renderer with EventIdChip, PriceChip, PercentChip, CapacityChip
- ✅ `src/app/chat/layout.tsx` — simple passthrough
- ✅ `src/app/chat/voice-input.ts` — English, en-US, already present
- ❌ `src/app/chat/page.tsx` — **does NOT exist yet — this is the only remaining task**

**Previous agent read all source files and documented every required change but was interrupted before writing the file. Do not re-read for research — go straight to writing.**

---

## Your Task

1. Read the orkestra source: `/home/ouss/Desktop/Work/app-suisse/orkestra/src/app/chat/page.tsx` (~4,884 lines)
2. Apply every adaptation in this document
3. Write `src/app/chat/page.tsx`
4. Run `cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | tail -40`
5. Fix any TypeScript errors, rebuild until clean
6. Verify `http://localhost:3000/chat` loads: no AppSidebar, full-screen layout, orange accent, English copy

---

## Context

You are building **Paradise Beach**, a beach venue management dashboard.
Project root: `/home/ouss/Desktop/Coding/paradise`
Tech: Next.js 16, TypeScript, Tailwind v4, Framer Motion, Lucide React

Everything in place:
- `AgentConversationProvider` at `src/components/dashboard/AgentConversationProvider.tsx` — exports `useAgentConversation`, `Conversation`, `Message`, `ToolCall`, `ToolResult`
- Agent memory: `src/agent/memory/store.ts` (`.save`, `.update`, `.remove`, `.list`) + `src/agent/memory/types.ts` (`MemoryKind`, `Memory`, `MemoryInput`)
- Voice input: `src/app/chat/voice-input.ts` — exports `isVoiceInputSupported`, `startVoiceInput`, `VoiceSession`
- Chat API route: `src/app/api/chat/route.ts` (streaming NDJSON at `POST /api/chat?stream=events`)

---

## Source Reference

The original orkestra chat page is at:
`/home/ouss/Desktop/Work/app-suisse/orkestra/src/app/chat/page.tsx`

Read that file in full before writing (~4,884 lines). Adapt it — do not rewrite from scratch. The file to create is `src/app/chat/page.tsx`.

---

## `src/app/chat/page.tsx` — Complete Adaptation Guide

This page is a single large file (~650 lines). Read the orkestra source, apply every adaptation below, then write the file.

---

### A. Imports

Add at top:
```ts
import React, { useState, useRef, useEffect, useCallback, useMemo, type ComponentType, type FormEvent, type KeyboardEvent } from "react";
```

Remove from imports:
- `Building2`, `GitCompareArrows`, `BarChart3`, `AlertTriangle` (BFSI icons)
- `Sidebar as AppSidebar` from `@/components/dashboard/Sidebar` — **completely remove**
- `useRouter` from `next/navigation` — not needed (no logout/redirect)
- `Database`, `Cpu` — not used

Add to lucide imports:
- `Ticket`, `Mic2`, `Users` (for suggested prompts)

Keep all other lucide imports: `ArrowUp`, `Plus`, `MessageSquare`, `Trash2`, `Sparkles`, `Calendar`, `TrendingUp`, `ChevronDown`, `ChevronRight`, `Wrench`, `CircleCheck`, `CircleAlert`, `PanelRightClose`, `PanelRightOpen`, `BookmarkPlus`, `Bookmark`, `Eye`, `StickyNote`, `Settings2`, `X`, `Pencil`, `Copy`, `Check`, `Search`, `Mic`, `MicOff`, `Brain`, `type LucideIcon`

---

### B. T token object

```ts
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
```

---

### C. Constants to remove / replace

**Remove entirely** (all tied to the AppSidebar that we're not using):
```ts
// DELETE these:
const APP_SIDEBAR_KEY = "orkestra.sidebar.collapsed";
const [appSidebarCollapsed, setAppSidebarCollapsed] = useState(false);
// DELETE the useEffect that reads APP_SIDEBAR_KEY
// DELETE toggleAppSidebar
// DELETE onLogout
// DELETE the useEffect/addEventListener for "orkestra:close-sidebars"
// DELETE the useEffect/dispatchEvent for "orkestra:close-sidebars"
```

**Replace localStorage keys:**
```ts
const SIDEBAR_STATE_KEY = "paradise.chat.sidebar.v1";
const SIDEBAR_COLLAPSED_KEY = "paradise.chat.sidebar-collapsed.v1";
```

**Replace breakpoint (820, not 720):**
```ts
const SIDEBAR_BREAKPOINT = 820;
```
Update ALL `@media (max-width: 720px)` and `@media (min-width: 721px)` in the `<style>` block to use `820px` / `821px`.

**Remove health check entirely:**
```ts
// DELETE:
const [health, setHealth] = useState<Health | null>(null);
// DELETE the useEffect that fetches "/api/agent"
// DELETE the Health type
// DELETE datasetLabel (the useMemo that derives from health.dataset)
// DELETE ModelChip component
// DELETE the Row component (used only by ModelChip)
```

**Simplify Sidebar call** — remove `datasetLabel` and `model` props:
```tsx
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
```
Update the Sidebar component props and UsageFooter accordingly — pass `datasetLabel={null}` internally or just remove it.

**Remove Composer's `model` prop** — the Composer no longer receives or displays model info.

---

### D. Suggested prompts

Replace the `SUGGESTIONS` array (rename to match existing code style, keep internal name `SUGGESTIONS` or rename to `SUGGESTED_PROMPTS` — either works):

```ts
const SUGGESTIONS: { title: string; hint: string; prompt: string; Icon: typeof Sparkles }[] = [
  { title: "This weekend's lineup", hint: "Artists performing soon",       prompt: "Who is playing this weekend?",                                         Icon: Calendar   },
  { title: "VIP availability",      hint: "Check remaining tickets",       prompt: "How many VIP tickets are left for each upcoming event?",               Icon: Ticket     },
  { title: "Reggae artists",        hint: "Summer performers",             prompt: "Show me all reggae artists performing this summer",                    Icon: Mic2       },
  { title: "Revenue forecast",      hint: "Ticket sales projection",       prompt: "What's the total revenue if all remaining General tickets sell out?",  Icon: TrendingUp },
  { title: "Headliners in July",    hint: "Top billing events",            prompt: "Which artists are headlining events in July 2026?",                    Icon: Users      },
  { title: "Tonight's vibe",        hint: "Next event summary",            prompt: "Give me a full summary of the next event",                             Icon: Sparkles   },
];
```

---

### E. Voice input — interface difference

The paradise `voice-input.ts` has a slightly different `onTranscript` signature:
```ts
// paradise VoiceCallbacks:
onTranscript(transcript: string, isFinal: boolean): void;
// orkestra used:
onTranscript: (transcript: string) => void;
```

In the Composer, just ignore the second parameter — TypeScript allows callbacks with fewer params:
```ts
onTranscript: (transcript) => {
  const base = dictationBaseRef.current;
  const sep = base && !/\s$/.test(base) ? " " : "";
  onChange(base + sep + transcript);
},
```

---

### F. All French → English string replacements

Apply these everywhere in the file (components, aria-labels, placeholders, copy):

**KIND_META labels:**
```ts
preference: { label: "Preferences", ... },
watch:      { label: "Watching",    ... },
"saved-view": { label: "Saved Views", ... },
note:       { label: "Notes",       ... },
```

**relTime function:**
```ts
function relTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} d`;
  return new Date(ts).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
}
```

**fmt function:**
```ts
function fmt(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}
```

**TopBar:**
- `"Fermer l'historique"` → `"Close history"`
- `"Ouvrir l'historique"` → `"Open history"`

**MemoryButton:**
- `"Fermer la mémoire"` → `"Close memories"`
- `"Ouvrir la mémoire"` → `"Open memories"`
- `"Mémoire de l'agent"` → `"Agent memories"`
- `<span>Mémoire</span>` → `<span>Memories</span>`

**Sidebar component:**
- `aria-label="Historique des conversations"` → `"Conversation history"`
- `"Replier le panneau"` → `"Collapse panel"`
- `<span>Espace</span>` → `<span>History</span>`
- `placeholder="Rechercher…"` → `placeholder="Search…"`
- `aria-label="Effacer la recherche"` → `"Clear search"`
- `<span>Conversations</span>` stays as-is (same in English)
- `"Aucune conversation ne correspond."` → `"No conversations match."`
- Button CTA: `"Nouvelle conversation"` → `"New conversation"`
- Button shadow uses blue (`rgba(0,122,255,0.55)`) — update to beach orange: `rgba(232,88,12,0.45)` and `rgba(232,88,12,0.55)`

**SidebarSlimRail:**
- `"Déployer le panneau"` → `"Expand panel"`
- `"Nouvelle conversation"` → `"New conversation"`
- `"Discussions · {n}"` → `"Conversations · {n}"`

**ConvRow:**
- `aria-label="Supprimer la conversation"` → `"Delete conversation"`

**UsageFooter:**
- `"Questions ce mois"` → `"Queries this month"`
- `"Données à jour"` → `"Data synced"`
- `"BrokerStar · 3 min · Odoo · 5 min"` → `"Events · live · Tickets · live"`

**MemoryDrawer:**
- `aria-label="Mémoire de l'agent"` → `"Agent memories"`
- `"Mémoire de l'agent"` heading → `"Agent Memories"`
- `"{n} souvenir{s}"` → `"{n} {memory/memories}"`
- `"Nouveau souvenir"` button → `"New memory"`
- `"Nouveau"` button label → `"New"`
- `"Fermer"` → `"Close"`
- Empty state heading `"Aucun souvenir"` → `"No memories yet"`
- Empty state body → `'Tell the agent "remember that…" or click Save on any response to build context.'`
- Empty state button `"Créer le premier"` → `"Create first"`

**MemoryPanel:**
- Section header `"Mémoire"` → `"Memories"`
- `"Ajouter"` → `"Add"`

**MemoryRow:**
- `title` attr: `"— cliquez pour ouvrir"` → `"— click to open"`
- `"Rejouer cette vue"` → `"Replay this view"`
- `"Supprimer ce souvenir"` → `"Delete memory"`

**MemoryDialog:**
- `"Nouveau souvenir"` (create title) → `"New memory"`
- `"Souvenir"` (edit title fallback) → `"Memory"`
- `"Modification"` → `"Edit"`
- `"Création"` → `"Create"`
- `"Fermer"` → `"Close"`
- Field label `"Type"` stays
- Field label `"Libellé"` → `"Label"`
- Field label `"Identifiant suivi (optionnel)"` → `"Watch target (optional)"`
- Field label `"Contenu"` → `"Content"`
- Placeholder `"ex. Vaudoise en premier"` → `"e.g. Prefer outdoor stage"`
- Placeholder `"CLT042 · POL1234 · SIN012"` → `"e.g. e1 · s3"`
- Textarea placeholder → `"Describe in one sentence what the agent should remember…"`
- Date format locale: `"fr-CH"` → `"en-US"`, labels `"Créé ·"` → `"Created ·"`, `"Maj ·"` → `"Updated ·"`
- `"Supprimer ce souvenir ?"` confirm → `"Delete this memory?"`
- `"Supprimer"` button → `"Delete"`
- `"Rejouer"` button → `"Replay"`
- `"Annuler"` → `"Cancel"`
- `"Enregistrer"` → `"Save"`
- `"Créer"` → `"Create"`

**Welcome component:**
- Eyebrow: `"Agent · Cabinet Müller"` → `"Agent · Paradise Beach"`
- H1: `"Que voulez-vous savoir sur le cabinet ?"` → `"Paradise Beach Assistant"`
- Paragraph: BFSI copy → `"Ask me anything about artists, events, and ticket availability."`
- Section label `"Pour démarrer"` → `"Get started"`
- Helper `"Cliquez une suggestion · ou tapez"` → `"Click a suggestion · or type"`

**UserMessage:**
- `"Vous"` eyebrow → `"You"`
- `"Modifier et renvoyer"` aria-label → `"Edit and resend"`
- `"Modifier"` button label → `"Edit"`
- `aria-label="Modifier votre message"` → `"Edit your message"`
- Edit mode hint: `"Échap pour annuler · ⌘/Ctrl + ↵ pour renvoyer"` → `"Esc to cancel · ⌘/Ctrl + ↵ to resend"`
- `"Annuler"` → `"Cancel"`
- `"Enregistrer"` → `"Save"`
- User bubble shadow — replace blue with orange:
  ```ts
  const bubbleShadow = "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(201,64,8,0.25), 0 8px 20px -10px rgba(232,88,12,0.40)";
  ```
- Save button shadow (in edit mode) — replace blue with orange:
  ```ts
  boxShadow: canSave ? "0 1px 2px rgba(201,64,8,0.18), 0 4px 12px -4px rgba(232,88,12,0.35)" : "none",
  // hover:
  "0 1px 2px rgba(201,64,8,0.18), 0 8px 18px -6px rgba(232,88,12,0.45)"
  ```

**AssistantMessage:**
- `"_(réponse vide)_"` and `"_(interrompu)_"` → `"_(empty response)_"` and `"_(interrupted)_"` (match what AgentConversationProvider emits)
- `aria-label="Copier la réponse"` → `"Copy response"`
- `"Copier"` → `"Copy"`, `"Copié"` → `"Copied"`
- `aria-label="Mémoriser cette réponse"` → `"Save to memory"`
- `"Mémoriser"` → `"Save"`

**ToolPanel:**
- `"{n} appel{s} d'outil"` → `"{n} tool call{s}"`
- `"Arguments"` stays
- `"Résultat"` → `"Result"`

**ThinkingIndicator:**
- Default label: `"L'agent interroge la donnée…"` → `"Thinking…"`
- The `toolLabel` function / `TOOL_LABELS` map — simplify to just return the tool name (no French labels):
  ```ts
  function toolLabel(name: string): string {
    return name.replace(/_/g, " ");
  }
  ```
  Remove the `TOOL_LABELS` map entirely.

**Composer:**
- `placeholder="Posez une question en français…"` → `"Ask about artists, events, or tickets…"`
- `aria-label="Message à l'agent"` → `"Message to the agent"`
- `aria-label="Arrêter la dictée"` → `"Stop dictating"`
- `title="Arrêter la dictée"` → `"Stop dictating"`
- `aria-label="Dicter une question"` → `"Dictate"`
- `title="Dicter une question"` → `"Dictate"`
- `aria-label="Arrêter la génération"` → `"Stop generating"`
- `aria-label="Envoyer"` → `"Send"`
- Error banner: `<strong>Erreur</strong>` → `<strong>Error</strong>`, `"fermer"` → `"close"`, `aria-label="Fermer l'erreur"` → `"Dismiss error"`
- Hint: `"envoyer"` → `"send"`, `"nouvelle ligne"` → `"new line"`
- Memory hint: `"{n} souvenir{s}"` → `"{n} {memory/memories}"`, `"{n} vue{s}"` → `"{n} saved {view/views}"`
- Voice error messages:
  ```ts
  if (err === "not-allowed" || err === "service-not-allowed") {
    onVoiceError?.("Microphone access was denied. Check your browser permissions.");
  } else if (err === "audio-capture") {
    onVoiceError?.("No microphone detected.");
  } else if (err === "network") {
    onVoiceError?.("Voice recognition service did not respond.");
  }
  ```
- Remove `model` prop from Composer signature and body (no health check).

**Scroll to bottom button:**
- `aria-label="Revenir au dernier message"` → `"Scroll to latest message"`
- `title="Revenir au dernier message"` → same

---

### G. Root layout — remove AppSidebar

In the main `return (...)`:
```tsx
// DELETE this block entirely:
<AppSidebar
  collapsed={appSidebarCollapsed}
  onToggle={toggleAppSidebar}
  onLogout={onLogout}
  onOpenPalette={() => {}}
  onOpenModal={() => router.push("/dashboard")}
/>
```

The root `<div className="agent-root">` contains only:
1. Chat column `<div className="agent-column">`
2. `<Sidebar ...>` (right rail)
3. `<AnimatePresence>` (memory drawer + dialog + scrim)
4. `<style>` tag

---

### H. CSS @media breakpoints

All `720px` references in the `<style>` block become `820px`. All `721px` become `821px`. Example:
```css
@media (max-width: 820px) { ... }
@media (min-width: 821px) { ... }
```

---

### I. Scroll bottom button aria strings
See section F above.

---

### J. Page title

Add near top of component (in a `useEffect`):
```ts
useEffect(() => {
  document.title = "Chat — Paradise Beach";
}, []);
```

---

## What NOT to change

- All conversation flow logic (send, stop, editUserMessage, newConversation)
- NDJSON streaming handler in AgentConversationProvider (page doesn't touch this)
- Memory store integration (same `.save`, `.update`, `.remove`, `.list` calls)
- Autoscroll logic (exact copy)
- Composer / textarea autogrow (exact copy)
- Message bubble layout and animations
- Sidebar layout and collapse/expand logic
- localStorage persistence keys in AgentConversationProvider (already correct)

---

## After writing the file

1. Run full build:
   ```
   cd /home/ouss/Desktop/Coding/paradise && source ~/.nvm/nvm.sh && nvm use 22 && pnpm build 2>&1 | tail -40
   ```
2. Fix any TypeScript errors
3. Start dev server: `pnpm dev` — verify `http://localhost:3000/chat` loads correctly
4. Confirm: no AppSidebar, full-screen layout, orange accent, English copy, working composer
