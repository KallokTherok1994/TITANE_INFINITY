# DEV/STATS SURFACE MATRIX

| surface/widget | current location | old location | source data | status | duplicated? | canonical owner | action needed |
|---------------|-----------------|-------------|-------------|--------|-------------|----------------|---------------|
| `StatsSystemPanels` | DevPage > Diagnostics tab | Stats.tsx (page route) | useEngineSubscription + IPC polling | ✅ FUSED | NO (single import) | DevPage | NONE |
| `Stats` full page | Stats.tsx (unrouted) | Stats.tsx (routed) | same as above | UNROUTED | NO | DevPage | Dead code — kept for rollback safety |
| `Stats` lazy import | App.tsx (REMOVED) | App.tsx line 121 | — | ❌ WAS DEAD IMPORT | NO | — | ✅ REMOVED |
| DEV nav item | topNavSections id:dev | same | — | ✅ CANONICAL | — | TopNav | NONE |
| STATS nav item | REMOVED from topNavSections | App.tsx line 888-893 | — | ❌ WAS DUPLICATE | YES | — | ✅ REMOVED |
| uiPages.stats definition | e2e/uiPages.po.js (kept) | same | — | ALIAS DOC | NO | — | Kept as docs alias |
| uiPages.stats in topLevelPageOrder | REMOVED | e2e/uiPages.po.js line 90 | — | ❌ WAS STALE E2E | YES | — | ✅ REMOVED |
