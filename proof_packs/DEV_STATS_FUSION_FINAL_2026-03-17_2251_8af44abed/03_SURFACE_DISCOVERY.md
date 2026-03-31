# SURFACE DISCOVERY

## src/pages/Stats.tsx
- Exports `StatsSystemPanels` → **IMPORTED by DevPage.tsx diagnostics tab** ✅
- Exports `Stats` (full page) → **NO ACTIVE ROUTE** — unrouted dead code (kept as rollback safety)
- Source data: `useEngineSubscription('nexus')`, `useEngineSubscription('helios')`, `tauriClient.orchestrationGetCognitiveState()` IPC polling

## src/pages/DevPage.tsx
- Imports `StatsSystemPanels` from `'./Stats'` ✅
- Renders in `Diagnostics` tab
- Source data: `useOneCore`, `useQAMonitoring`, IPC polling for orchestration

## TopNav (App.tsx topNavSections)
- **BEFORE FIX**: STATS + DEV both present (both route `/dev`) → DUPLICATE_NAV_AUTHORITY
- **AFTER FIX**: DEV only (canonical) ✅

## E2E (uiPages.po.js)
- `uiPages.stats` definition: **kept** (documents historical alias, no nav-click harm)
- `topLevelPageOrder`: **STATS removed** (was causing nav-stats click attempts) ✅
