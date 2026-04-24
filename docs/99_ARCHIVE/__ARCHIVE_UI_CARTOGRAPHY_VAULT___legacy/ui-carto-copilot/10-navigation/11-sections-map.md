# Sections Map — Sub-Navigation Details

**Date:** 2026-02-07  
**Scope:** Detailed breakdown of each TopNav section's internal tabs/sub-sections

---

## TITANE Section (`/titane`)

**File:** `src/pages/TitanePage.tsx`  
**Pattern:** Tab-based navigation (state-driven, no URL routing)

### Tabs (8 Sections)

| Tab ID | Label | Icon | Component | Purpose | Data Source |
|--------|-------|------|-----------|---------|-------------|
| `conversation` | Chat | 💬 | `ConversationSection` | AI Chat interface, multi-provider support | Chat store |
| `overview` | Vue | 📊 | `OverviewSection` | System dashboard & real-time stats | XP Engine |
| `vision` | Vision | 📷 | `VisionSection` | Visual perception & affect estimation | Vision store |
| `identity` | Identité | 🧬 | `IdentitySection` | Identity matrix, modes, covenant | Identity store |
| `memory-map` | Mémoire | 💾 | `MemorySection` | Triple memory architecture (short/mid/long) | Memory store |
| `memory-evolution` | Évolution | 🔄 | `MemoryEvolutionSection` | Internal dynamics, evolution journal | Memory engine |
| `progression` | XP | ⚡ | `ProgressionSection` | XP system, milestones, talent tree | XP Engine |
| `transformation` | Transform | 🌱 | `TransformationSection` | Evolution lines & tier progression | Evolution store |

### State Management
```typescript
const [activeTab, setActiveTab] = useState<TitaneTabId>('conversation');
```

### Tab Switching
- **Type:** `TitaneTabId` union type
- **Default:** `'conversation'` (Chat)
- **Animation:** None (instant switch)

### Accessibility
- **Panel IDs:** `titane-panel-{tabId}`
- **Label IDs:** `titane-tab-{tabId}`
- **ARIA roles:** `tablist`, `tab`, `tabpanel`
- **ARIA selected:** `true/false`
- **ARIA controls:** `titane-panel-{tabId}`

### Stats Display
```typescript
interface Stats {
  totalXP: number;
  level: number;
  memoryShortTerm: number;
  memoryMidTerm: number;
  memoryLongTerm: number;
  evolutionScore: number;
}
```
- Source: `xpEngine.getState()` → `ProgressionState`

---

## DEV Section (`/dev`)

**File:** `src/pages/DevPage.tsx`  
**Pattern:** Section-based navigation (9 major areas)

### Sections (9 Dev Tools)

| Section ID | Label | Icon | Purpose | Components/Features |
|------------|-------|------|---------|---------------------|
| `overview` | Vue d'ensemble | 🎯 | Global health dashboard | ONE CORE status, QA score, Orchestration state |
| `devtools` | Dev Tools | 💻 | Core operations | Patch, Refactor, Rewrite, Audit, Test, Rollback buttons |
| `command-center` | Command Center | 🎯 | ONE CORE management | Centers health bars, engine stats, management |
| `system-commands` | System Commands | 📊 | System maintenance | Sync, Health Check, Optimize, Repair, GC, Backup |
| `qa-tests` | QA & Tests | 🧪 | Testing dashboard | Test coverage, monitors, suite execution |
| `orchestration` | Orchestration | 🔥 | Multi-AI orchestration | Nexus, Harmonia, Meta state visualization |
| `security` | Security | 🛡️ | Security alerts | Critical/Warning alerts, acknowledgment system |
| `metrics` | Metrics | 📈 | Performance metrics | CPU, Memory, Disk, Web Vitals, Uptime |
| `optimization` | Ultimate Optimization | ⚡ | Advanced optimization | `UltimateOptimizationDashboard` component |

### Data Sources
```typescript
// ONE CORE state
const { state, health, centers } = useOneCore();

// QA monitoring
const { qaScore, testSuites, monitors } = useQAMonitoring();

// Orchestration state
const orchestrationState = await secureInvoke('orchestration_get_unified_state');
```

### State Management
```typescript
type SectionId = 
  | 'overview' 
  | 'devtools' 
  | 'command-center'
  | 'system-commands'
  | 'qa-tests'
  | 'orchestration'
  | 'security'
  | 'metrics'
  | 'optimization';

const [activeSection, setActiveSection] = useState<SectionId>('overview');
```

### Real-time Updates
- **QA Monitoring:** Polls every 5 seconds
- **ONE CORE Health:** Real-time subscriptions
- **Orchestration State:** On-demand refresh

---

## ADMIN Section (`/admin`)

**File:** `src/features/admin/AdminPage.tsx`  
**Pattern:** Tab-based with lazy-loaded sub-pages

### Tabs (5 Admin Centers)

| Tab ID | Label | Icon | Page Component | Purpose | Features |
|--------|-------|------|----------------|---------|----------|
| `system` | Système | ⚙️ | `SystemCenterPage` | System diagnostics | DevTools, Cluster, Introspection, HyperVision |
| `config` | Configuration | 🎛️ | `ConfigurationHub` | Config management | Centralized configuration hub |
| `audio` | Audio & Voix | 🔊 | `AudioCenterPage` | Audio/Voice center | TTS, Vocal Profiles, Audio settings |
| `design` | Design | 🎨 | `DesignCenterPage` | Design system | Appearance, UI Tokens, Theme editor |
| `governance` | Gouvernance | 🛡️ | `GovernanceCenterPage` | Security & policies | Secrets, AI Policies, Permissions |

### Tab Configuration
```typescript
// src/features/admin/types.ts
export enum AdminTab {
  SYSTEM = 'system',
  CONFIG = 'config',
  AUDIO = 'audio',
  DESIGN = 'design',
  GOVERNANCE = 'governance',
}

export const ADMIN_TABS = [
  { id: AdminTab.SYSTEM, label: 'Système', icon: '⚙️' },
  { id: AdminTab.CONFIG, label: 'Configuration', icon: '🎛️' },
  { id: AdminTab.AUDIO, label: 'Audio & Voix', icon: '🔊' },
  { id: AdminTab.DESIGN, label: 'Design', icon: '🎨' },
  { id: AdminTab.GOVERNANCE, label: 'Gouvernance', icon: '🛡️' },
];
```

### Lazy Loading Pattern
```typescript
const SystemCenterPage = lazy(() => import('./system-center/SystemCenterPage'));
const ConfigurationHub = lazy(() => import('./config/ConfigurationHub'));
// ... etc.
```

### Error Boundary
- **Component:** `ErrorBoundary` wraps each tab content
- **Fallback:** Generic error message with retry

### Animation
- **Library:** Framer Motion
- **Pattern:** Fade + slide (50px translateX)
- **Duration:** 300ms
- **Easing:** `ease-in-out`

---

## STATS Section (`/stats`)

**File:** `src/pages/Stats.tsx`  
**Pattern:** Multi-panel dashboard (no tabs)

### Sub-sections (4 Monitoring Panels)

| Section | Icon | Metrics | Component | Data Source |
|---------|------|---------|-----------|-------------|
| **Réseau Cognitif (NEXUS)** | 🧠 | Nodes, Edges, Network Density | `ModuleCard` | `useEngineSubscription('nexus')` |
| **Système Vital (HELIOS)** | 💓 | BPM, Vitality Score, System Load, Temperature, Uptime | `ModuleCard` | `useEngineSubscription('helios')` |
| **Équilibre des Flux (HARMONIA)** | ⚖️ | Active Flows, Balance Score, Coherence | `ModuleCard` | `useEngineSubscription('harmonia')` |
| **État Cognitif** | 🧠 | Cognitive Score, Stability, Mental Load, Reasoning Quality, Depth, Active Processes | `ModuleCard` | `secureInvoke('orchestration_get_cognitive_state')` |

### Data Flow
```typescript
// Real-time engine subscriptions
const nexusData = useEngineSubscription('nexus');
const heliosData = useEngineSubscription('helios');
const harmoniaData = useEngineSubscription('harmonia');

// Cognitive state polling (5s intervals)
const { data: cognitiveState } = useQuery({
  queryKey: ['cognitive-state'],
  queryFn: () => secureInvoke('orchestration_get_cognitive_state'),
  refetchInterval: 5000,
});
```

### Layout
- **Grid:** 3-column responsive (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Gap:** `gap-6`
- **Card Component:** `<ModuleCard>` (from `src/components/monitoring/ModuleCard.tsx`)

### Update Frequency
- **NEXUS/HELIOS/HARMONIA:** Real-time (via WebSocket/IPC subscriptions)
- **Cognitive State:** 5-second polling interval

---

## TIME Section (`/time`)

**File:** `src/pages/TimePage.tsx`  
**Pattern:** Unified temporal center

### Features
- **Agenda:** Event scheduling and management
- **Timeline:** Historical event visualization
- **Reminders:** Notification system
- **Temporal Metrics:** Time-based analytics

### Data Source
- **Service:** `src/services/agenda/agendaService.ts`
- **Tauri Commands:** CRUD operations via `secureInvoke()`

---

## FUSION Section (`/fusion`)

**File:** `src/pages/FusionPage.tsx` (if exists)  
**Purpose:** Backend/Frontend integration visualization

### Potential Features (TBD)
- IPC command monitoring
- Service layer visualization
- Ring architecture validation
- Bridge health status

---

## OPTIMIZE Section (`/optimization`)

**File:** `src/pages/OptimizationPage.tsx` (if exists)  
**Purpose:** Advanced performance optimization

### Potential Features (TBD)
- Bundle analysis
- Memory profiling
- Render optimization
- Cache management

---

## Navigation Patterns Summary

| Section | Tab Count | Navigation Type | Animation | Real-time |
|---------|-----------|----------------|-----------|-----------|
| **TITANE** | 8 | State-based tabs | None | Partial (stats) |
| **DEV** | 9 | Section-based | None | Yes (QA, ONE CORE) |
| **ADMIN** | 5 | Lazy-loaded tabs | Framer Motion | No |
| **STATS** | 4 | Multi-panel dashboard | None | Yes (engines) |
| **TIME** | N/A | Single-page | N/A | Yes (agenda) |

---

## Component File Locations

### Titane Sections
```
src/components/sections/
├── ConversationSection.tsx
├── OverviewSection.tsx
├── VisionSection.tsx
├── IdentitySection.tsx
├── MemorySection.tsx
├── MemoryEvolutionSection.tsx
├── ProgressionSection.tsx
└── TransformationSection.tsx
```

### Admin Centers
```
src/features/admin/
├── system-center/
│   └── SystemCenterPage.tsx
├── config/
│   └── ConfigurationHub.tsx
├── audio-center/
│   └── AudioCenterPage.tsx
├── design-center/
│   └── DesignCenterPage.tsx
└── governance-center/
    └── GovernanceCenterPage.tsx
```

### Dev Page
```
src/pages/
└── DevPage.tsx (single file, 9 sections)
```

### Stats Components
```
src/components/monitoring/
└── ModuleCard.tsx
```

---

## Next: Routes Map

⏭️ Continue to `12-routes-map.md` for complete route configuration and component mapping.
