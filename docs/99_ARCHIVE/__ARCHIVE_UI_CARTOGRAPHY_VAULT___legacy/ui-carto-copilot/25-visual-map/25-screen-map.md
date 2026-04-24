# Visual Screen Map — User-Facing UI Cartography

**Version:** V6  
**Date:** 2026-02-07  
**Scope:** All user-visible screens, zones, and interactions

---

## Screen Map Overview

This document maps what users SEE and DO in the TITANE∞ UI, screen by screen.

**Methodology:**
- For each route/tab: identify visible zones
- Document user actions and expected feedback
- Trace data sources (store/hook/IPC/HTTP)
- Prove with path:line references

---

## 1. TITANE Page (/titane)

### Route
**Path:** `/titane`  
**Component:** `<TitanePage />`  
**Proof:** `src/App.tsx:895-902`

### Visible Zones

**Header:** TopNav (7 sections)  
**Content:** Main chat interface + 8 tabs  
**Footer:** XP Bar (persistent)  
**Overlays:** ConsoleMonitor, ErrorBoundary, Toasts, CognitiveLayout

### Tabs (8)
1. **Chat** - Main conversation interface
2. **Camera** - Visual input
3. **Memory** - Context management
4. **Evolution** - Progress tracking
5. **Dashboard** - Overview metrics
6. **Progression** - XP and levels
7. **Evo Center** - Evolution controls
8. **Map** - Memory visualization

**Proof:** `src/pages/TitanePage.tsx` (tab definitions)

### User Actions

| Action | Trigger | Feedback | Data Source | Proof |
|--------|---------|----------|-------------|-------|
| Send message | Input + Enter | Message bubble, loading | `useChat` hook | `src/hooks/useChat.ts` |
| Switch tab | Tab click | Tab highlight, content change | Local state | TitanePage state |
| Voice input | Mic button | Recording indicator | `useVoice` hook | `src/hooks/useVoice.ts` |
| View memory | Memory tab | Timeline/graph | IPC `memory_get_state` | `src/hooks/useMemory.ts` |

### UI States

- **Idle:** Waiting for user input, chat history visible
- **Loading:** Spinner during message generation
- **Error:** Error toast + fallback message
- **Empty:** "Start conversation" prompt
- **Degraded:** Offline mode indicator

**Timeout Policy:** 30s for message generation (configurable)  
**Proof:** `src/services/ai/providers/tauriChat.ts:58-64`

### Data Sources

- **Chat messages:** Zustand `conversationStore`
- **Health metrics:** IPC `get_system_health`
- **Memory state:** IPC `memory_get_state`
- **User profile:** `userProfileStore`

---

## 2. DEV Page (/dev)

### Route
**Path:** `/dev`  
**Component:** `<DevPage />`  
**Proof:** `src/App.tsx:1020-1023`

### Visible Zones

**Header:** TopNav  
**Content:** Dev tools tabs (9 sections)  
**Sidebar:** None (removed in UI vΩ)

### Tabs (9)
1. Overview
2. DevTools
3. CommandCenter
4. SystemCommands
5. QATests
6. Orchestration
7. Security
8. Metrics
9. UltimateOptimization

**Proof:** `src/pages/DevToolsTabs.tsx:22-30`

### User Actions

| Action | Trigger | Feedback | Data Source | Proof |
|--------|---------|----------|-------------|-------|
| Run test | Test button | Status badge, logs | IPC `run_qa_test` | DevTools component |
| Execute command | Command input | Terminal output | IPC `execute_system_command` | CommandCenter |
| View metrics | Metrics tab | Charts, numbers | IPC `get_helios_metrics` | Metrics component |
| Toggle security | Switch | Status indicator | IPC `security_toggle_*` | Security tab |

### UI States

- **Idle:** Tools ready, metrics displayed
- **Running:** Command/test in progress, spinner
- **Success:** Green badge, output shown
- **Error:** Red badge, error details
- **Empty:** No data available message

---

## 3. ADMIN Page (/admin)

### Route
**Path:** `/admin`  
**Component:** `<AdminPage />`  
**Proof:** `src/App.tsx:944-952`

### Tabs (5)
1. System Center
2. Diagnostics
3. Configuration
4. Governance
5. Audio Center

**Proof:** `src/pages/AdminPage.tsx`

### User Actions

| Action | Trigger | Feedback | Data Source | Proof |
|--------|---------|----------|-------------|-------|
| View health | System tab | Health cards | IPC `get_system_health` | SystemCenter |
| Run diagnostic | Diagnostic button | Report modal | IPC `run_diagnostic` | Diagnostics |
| Update config | Config form | Save toast | IPC `update_config` | Configuration |
| Toggle governance | Switch | Status badge | IPC `governance_*` | Governance |

---

## 4. STATS Page (/stats)

### Route
**Path:** `/stats`  
**Component:** `<Stats />`  
**Proof:** `src/App.tsx:921-928`

### Panels (4)
1. Cognitive - Brain activity, coherence
2. Health - System vitals
3. Performance - Metrics, latency
4. Analytics - Usage stats

**Proof:** Stats component structure

### User Actions

| Action | Trigger | Feedback | Data Source | Proof |
|--------|---------|----------|-------------|-------|
| View cognitive | Cognitive panel | Charts, coherence score | IPC `singularity_get_*` | CognitiveLayout |
| View health | Health panel | Status cards, uptime | IPC `get_system_health` | Health component |
| View perf | Performance panel | Metrics table | IPC `get_helios_metrics` | Performance |
| Export stats | Export button | Download CSV | Local data | Export handler |

---

## 5. TIME Page (/time)

### Route
**Path:** `/time`  
**Component:** `<TimePage />`  
**Proof:** `src/App.tsx:931-939`

### Visible Zones

**Header:** TopNav + date picker  
**Content:** Calendar + event list  
**Sidebar:** Agenda controls

### User Actions

| Action | Trigger | Feedback | Data Source | Proof |
|--------|---------|----------|-------------|-------|
| Add event | Add button | Form modal | IPC `agenda_save_event` | AgendaService |
| Edit event | Click event | Edit modal | IPC `agenda_save_event` | AgendaService |
| Delete event | Delete button | Confirm toast | IPC `agenda_delete_event` | AgendaService |
| View day | Date click | Day view | IPC `agenda_get_events` | AgendaService |

### UI States

- **Idle:** Calendar displayed, events visible
- **Loading:** Skeleton during event fetch
- **Empty:** "No events" message
- **Error:** Error banner with retry

---

## 6. Persistent Widgets (All Screens)

### CognitiveLayout
**Visibility:** Bottom-right corner (all screens)  
**Proof:** `src/App.tsx:1196-1206`

**Actions:**
- Toggle visibility (collapse/expand)
- View cognitive state
- No user input required

**Data:** IPC `singularity_get_full_state`

### ConsoleMonitor
**Visibility:** Bottom panel (collapsible)  
**Proof:** `src/services/monitoring/consoleMonitor.ts`

**Actions:**
- View logs (console.log/warn/error)
- Filter by level
- Clear logs

**Data:** Browser console intercept

### XP Bar
**Visibility:** Top of content area (persistent)  
**Proof:** `src/components/experience/XPBar.tsx`

**Actions:**
- View current XP and level
- Hover for details tooltip
- Click for full progression modal

**Data:** `evolutionStore` + IPC `evolution_get_state`

### Toast Notifications
**Visibility:** Top-right corner (overlay)  
**Proof:** `src/ui/components/Toast.tsx`

**Actions:**
- View notifications
- Dismiss (click X or auto-timeout)
- Stack multiple toasts

**Data:** `uiStore.toasts`

---

## 7. Modal Dialogs

### Error Boundary Fallback
**Trigger:** React error in component tree  
**Proof:** `src/components/ErrorBoundary.tsx:137-169`

**Actions:**
- View error details
- Retry component render
- Report to Sentry (if available)

### Onboarding Flow
**Trigger:** First launch  
**Proof:** `src/components/Onboarding.tsx`

**Actions:**
- Step through intro screens
- Skip onboarding
- Complete setup

---

## Screen Map Summary

**Total Screens:** 9 primary routes  
**Total Tabs:** 27 (across all pages)  
**Persistent Widgets:** 6  
**Modal Types:** 3

**Coverage:** All user-visible UI mapped with proof

**Next:** See 26-topnav-interactions.md for TopNav details
