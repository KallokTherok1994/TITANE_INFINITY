# Repository Fingerprint — Frontend Structure

**Date:** 2026-02-07  
**Scope:** Frontend UI Architecture

---

## Source Tree Overview

### Root Directory Structure
```
TITANE_INFINITY/
├── src/                          # Frontend source (React + TypeScript)
├── src-tauri/                    # Backend (Rust + Tauri v2)
├── e2e/                          # Playwright E2E tests
├── tests/                        # Vitest unit/integration tests
├── public/                       # Static assets
├── dist/                         # Build output (git-ignored)
├── docs/                         # Documentation
├── scripts/                      # Build/dev/audit scripts
├── config/                       # Configuration files
├── registry/                     # Event registry (UI changes)
├── .github/                      # GitHub Actions + Copilot
├── node_modules/                 # Dependencies (git-ignored)
└── package.json                  # Project manifest
```

### `src/` Directory Organization (Frontend Only)

```
src/
├── main.tsx                      # Entry point (React bootstrap)
├── App.tsx                       # Root component (48.5 KB, 40+ lazy-loaded pages)
├── router.tsx                    # Secondary router (React Router v7, 13 routes)
├── index.css                     # Global styles
├── vite-env.d.ts                # Vite types
│
├── components/                   # Reusable UI components (~150 files)
│   ├── layout/                   # AppShell, TopNav, Header, Sidebar, MobileNav
│   ├── chat/                     # ChatBubble, MessageList, ChatInput, ConversationsSidebar (30+ files)
│   ├── panels/                   # ChatPanel, DevToolsPanel, MemoryPanel, SelfHealingPanel
│   ├── monitoring/               # SystemHealthMonitor, SingularityDashboard, MetricsCard (10+ files)
│   ├── devtools/                 # LogViewer, MemoryTree, CoreHealthMonitor
│   ├── experience/               # XPBar, ExpPanel, TalentTree
│   ├── sections/                 # OverviewSection, ProgressionSection, MemoryEvolutionSection (8+ files)
│   ├── ui/                       # Base components (button, card, dialog, tabs, input, etc.)
│   ├── centers/                  # HyperCenter, QuantumCenter, IdentityCenter, MemoryEvolutionCenter, MetaCenter
│   ├── voice/                    # Voice control components
│   ├── vision/                   # Vision/camera components
│   ├── audio/                    # Audio components
│   ├── cognitive/                # Cognitive system UI
│   └── evolution/                # Evolution tracking UI
│
├── features/                     # Domain-specific feature modules
│   ├── chat/                     # Chat subsystem
│   ├── governance-center/        # Governance UI
│   ├── system-center/            # System management
│   ├── identity/                 # Identity management
│   ├── progression/              # Progression tracking
│   ├── dashboard/                # Dashboard editor
│   ├── design-center/            # Design tools
│   ├── developer-mode/           # Dev mode UI
│   ├── admin/                    # Admin controls
│   ├── memory/                   # Memory features
│   ├── kernel/                   # Core kernel visualization
│   └── cognitive/                # Cognitive features
│
├── pages/                        # Route-level components
│   ├── TitanePage.tsx            # Main hub (/titane)
│   ├── Stats.tsx                 # Statistics page
│   ├── TimePage.tsx              # Time/agenda page
│   ├── Experience.tsx            # XP progression page
│   ├── AdminPage.tsx             # Admin/system page
│   ├── ChatPage.tsx              # Chat interface
│   ├── DashboardPage.tsx         # Dashboard
│   ├── Sentinel.tsx              # Sentinel engine
│   ├── Watchdog.tsx              # Watchdog engine
│   ├── SelfHeal.tsx              # Self-healing UI
│   ├── Memory.tsx                # Memory system page
│   ├── Settings.tsx              # Settings page
│   ├── DevTools.tsx              # Dev tools page
│   ├── CloudCenter/              # Cloud features
│   └── tabs/                     # Dev tool tabs (PerformanceTab, DiagnosticTab, SystemTab, LogsTab)
│
├── stores/                       # Zustand state management (15+ stores)
│   ├── uiStore.ts                # UI state (sidebar, modals, toasts)
│   ├── systemStore.ts            # System metrics, health
│   ├── memoryStore.ts            # Memory data management
│   ├── evolutionStore.ts         # Evolution tracking
│   ├── visualStateStore.ts       # Visual rendering state
│   ├── effectsStore.ts           # Animation/visual effects
│   ├── panelsStore.ts            # Panel visibility/state
│   ├── usePerformanceStore.ts    # Performance metrics
│   ├── useTTSEngineStore.ts      # Text-to-speech state
│   ├── useSelfHealingStore.ts    # Self-healing engine state
│   ├── useVisionStore.ts         # Vision/camera state
│   ├── useChatModeStore.ts       # Chat mode tracking
│   ├── useMemoryEngineStore.ts   # Memory engine state
│   ├── useRequestInFlightStore.ts # API request tracking
│   ├── useAutomationXPStore.ts   # XP automation
│   └── *.selectors.ts            # Memoized selectors for performance
│
├── hooks/                        # Custom React hooks (80+ hooks)
│   ├── useChat*.ts               # Chat hooks (useChat, useChatCore, useChatMemory, useChatUI, useChatStreaming)
│   ├── useVoice*.ts              # Voice hooks (useVoice, useVoiceEngine, useVoiceInput, useVoiceMode, useVAD)
│   ├── useMemory*.ts             # Memory hooks (useMemory, useMemoryCore, useMemoryEngine, useUnifiedMemory)
│   ├── useSystem*.ts             # System hooks (useSystemHealth, useBackendHealth, useSingularity)
│   ├── usePerformance*.ts        # Performance hooks (usePerformanceMonitor, useAdaptiveFPS, useAdvancedPerformance)
│   └── useState*.ts              # State hooks (useSingularityState, useVisualState, useIdentity)
│
├── lib/                          # Core utilities & Tauri bridge
│   ├── tauriClient.ts            # Centralized Tauri command wrapper (typed)
│   ├── tauriCommands.ts          # Command registry (180+ commands)
│   ├── ipc.ts                    # IPC wrapper (replaces direct fetch("ipc://..."))
│   ├── security.ts               # Security & command whitelist (secureInvoke)
│   └── ...
│
├── services/                     # Backend service abstractions (Ring 3)
│   ├── agenda/                   # Agenda service (CRUD événements)
│   ├── cognitive/                # Cognitive layout service (Helios/Nexus)
│   ├── chat/                     # Chat service
│   ├── memory/                   # Memory service
│   └── ...
│
├── engines/                      # Business logic engines (Ring 2 - NO I/O)
│   ├── Orchestrator/             # Coordination globale
│   ├── StyleEngine/              # Thèmes et apparence
│   ├── CoherenceEngine/          # Cohérence contextuelle
│   ├── ReflectionEngine/         # Analyse réflexive
│   ├── EmotionEngine/            # États émotionnels
│   ├── UnifiedMemory/            # Mémoire persistante
│   ├── BehaviorEngine/           # Patterns comportementaux
│   ├── AdaptationEngine/         # Adaptation contextuelle
│   └── SystemHealth/             # Monitoring santé système
│
├── types/                        # TypeScript type definitions (Ring 1 - Core)
│   ├── voice.ts                  # EmotionalState, ThinkingState, MentalColor
│   ├── memoryEngine.ts           # MemoryMetadata, ConversationMode
│   ├── singularityState.ts       # Singularity types
│   ├── logLevel.ts               # Log level types
│   └── ...
│
├── constants/                    # Application constants (Ring 1 - Core)
│   └── ...
│
├── layouts/                      # Page layouts
│   └── AppLayout.tsx             # Alternate layout component
│
├── themes/                       # Theme definitions
│   └── ...
│
├── design-system/                # Design tokens & components
│   ├── tokens.ts                 # Design tokens
│   ├── visual-states.ts          # Visual state definitions
│   ├── motion.ts                 # Animation definitions
│   └── components/               # Design system components (UIStates, TBadge, TSectionHeader, TMetric)
│
├── utils/                        # Utility functions
│   ├── browserModeAdapter.ts    # Fallback for browser mode (no Tauri)
│   └── ...
│
├── config/                       # Configuration files
│   └── ...
│
├── core/                         # Core system modules
│   ├── tauri/                    # Tauri integration
│   │   └── environment.ts        # Environment detection (detectEnvironment())
│   └── ...
│
├── security/                     # Security modules
│   └── ...
│
├── monitoring/                   # System monitoring modules
│   └── ...
│
├── __tests__/                    # Test files
│   ├── architecture/             # Architecture tests (Ring isolation)
│   ├── compliance/               # Compliance tests
│   └── *omega*.test.ts           # OMEGA pipeline tests
│
├── test-utils/                   # Test utilities
│   └── ...
│
├── tauri-init-fix.ts             # Tauri initialization patch
├── tauri-protection-patch.ts     # Tauri security hardening
└── boot-diagnostics.ts           # Boot diagnostic markers
```

---

## Frameworks Detected

### Frontend Framework Stack
- **UI Library:** React 19.2.4 (Concurrent Mode, Suspense, lazy loading)
- **Build Tool:** Vite 7.3.1 (ES modules, HMR, code splitting)
- **Router:** React Router v7.13.0 (BrowserRouter, lazy routes, suspense)
- **State Management:** Zustand 5.0.11 (immutable state, persist middleware, devtools)
- **Styling:** Tailwind CSS 4.1.18 + CSS Modules + Design Tokens
- **Animation:** Framer Motion 12.29.2
- **Type System:** TypeScript 5.9.3 (strict mode)

### Testing Stack
- **Unit/Integration:** Vitest 4.0.18 (Vite-native test runner)
- **Browser Testing:** @vitest/browser 4.0.18 + Playwright
- **E2E Testing:** Playwright 1.58.1
- **Coverage:** @vitest/coverage-v8 4.0.18
- **Testing Library:** @testing-library/react 16.3.2

### Backend Integration
- **Desktop Framework:** Tauri v2.2.0 (Rust backend)
- **IPC:** Tauri IPC + custom secureInvoke wrapper
- **Security:** CSP enforcement, command whitelist, anti-injection

### Additional Libraries
- **Data Fetching:** @tanstack/react-query 5.90.20
- **Icons:** lucide-react 0.563.0
- **Date/Time:** date-fns 4.1.0
- **Charts:** recharts 3.6.0
- **3D Graphics:** three.js 0.182.0
- **Markdown:** react-markdown 10.1.0 + remark-gfm 4.0.1
- **i18n:** i18next 25.8.0 + react-i18next 16.5.4
- **Validation:** zod 4.3.6
- **Toasts:** sonner 2.0.7

---

## Critical Files

### Entry Points
1. **`src/main.tsx`** - React bootstrap (imports App, applies Tauri patches)
2. **`src/App.tsx`** - Root component (48.5 KB, providers, lazy routes, redirects)
3. **`src/router.tsx`** - Secondary router (13 routes with AppLayout wrapper)
4. **`index.html`** - HTML entry point (Vite base)

### Router Files
- **Primary:** `src/App.tsx` (routes defined inline with lazy loading)
- **Secondary:** `src/router.tsx` (alternate routing system, React Router v7)
- **Route Components:** `src/pages/*.tsx` (15+ page components)

### Providers
Defined in `src/App.tsx`:
1. **ThemeProvider** - Theme context (dark/light mode, custom themes)
2. **AnimationProvider** - Animation settings (reduced motion, performance)
3. **TitanStateProvider** - Global TITANE state
4. **ToastProvider** - Toast notifications (Sonner)
5. **BrowserRouter** - React Router context
6. **ErrorBoundary** - Error catching (AutoHealErrorBoundary, generic ErrorBoundary)
7. **Suspense** - Lazy loading fallback

### Themes & Tokens
- **`src/themes/`** - Theme definitions (CSS variables, color palettes)
- **`src/design-system/tokens.ts`** - Design tokens (spacing, typography, colors)
- **`src/design-system/visual-states.ts`** - Visual state definitions
- **`src/design-system/motion.ts`** - Animation definitions
- **`src/index.css`** - Global styles (CSS reset, Tailwind imports, custom properties)

### Tauri Bridge
1. **`src/lib/tauriClient.ts`** - Typed command wrapper (all IPC calls)
2. **`src/lib/tauriCommands.ts`** - Command registry (180+ commands)
3. **`src/lib/ipc.ts`** - IPC wrapper (secureInvoke pattern)
4. **`src/lib/security.ts`** - Security layer (command whitelist, validation)
5. **`src/tauri-init-fix.ts`** - Initialization patch (ensures Tauri availability)
6. **`src/tauri-protection-patch.ts`** - Security hardening (post-init)
7. **`src/core/tauri/environment.ts`** - Environment detection (isTauri, isBrowser, isDev)

---

## Architecture Notes

### 4-Ring Model (v24.3.0)
**RÈGLE FONDAMENTALE:** Les anneaux intérieurs ne peuvent JAMAIS importer les anneaux extérieurs.

- **Ring 1 (Core):** `src/types/`, `src/constants/` — Types, interfaces, constantes (ZERO imports)
- **Ring 2 (Engines):** `src/engines/*/` — Logique métier pure SANS I/O (imports Ring 1 only)
- **Ring 3 (Services):** `src/services/*/` — Abstractions I/O, Tauri calls, localStorage (imports Ring 1 + 2)
- **Ring 4 (OS/UI):** `src-tauri/src/`, React components — UI + Tauri backend (accès total)

### Key Architectural Patterns
1. **Lazy Loading:** 40+ pages lazy-loaded via `React.lazy()` + `Suspense`
2. **Code Splitting:** Vite automatic chunking by route
3. **Centralized IPC:** All Tauri commands via `tauriClient.ts` (no direct `invoke()`)
4. **Selector Pattern:** Zustand stores export memoized selectors (`*.selectors.ts`)
5. **Error Boundaries:** Multi-layer error handling (page-level + global)
6. **Service Abstraction:** All I/O via services (Ring 3), never in engines (Ring 2)

---

## File Statistics

### Source Code Distribution
```bash
# Total TypeScript/React files in src/
$ find src -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l
# Estimated: 500+ files

# Components
$ find src/components -type f -name "*.tsx" | wc -l
# Estimated: 150+ files

# Pages
$ find src/pages -type f -name "*.tsx" | wc -l
# Estimated: 30+ files

# Stores
$ find src/stores -type f -name "*.ts" | wc -l
# 15+ stores

# Hooks
$ find src/hooks -type f -name "*.ts" | wc -l
# 80+ hooks

# Engines (Ring 2)
$ find src/engines -type d -maxdepth 1 | wc -l
# 9 engines
```

---

## Next Phase

✅ PHASE A: PREFLIGHT complete  
⏭️ Proceed to PHASE B: NAVIGATION — Map routes, layout, persistent widgets
