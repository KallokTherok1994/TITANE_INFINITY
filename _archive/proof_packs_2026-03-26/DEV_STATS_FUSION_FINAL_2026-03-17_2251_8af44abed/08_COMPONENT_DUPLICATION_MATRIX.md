# COMPONENT DUPLICATION MATRIX

| old component | new component | overlap type | safe to delete? | safe to alias? | must merge? | rollback note |
|--------------|--------------|-------------|-----------------|----------------|-------------|---------------|
| `Stats` (full page, unrouted) | `StatsSystemPanels` (embedded DEV) | Content | YES — no active route | N/A | NO — already reused via export | `git restore -- src/pages/Stats.tsx` |
| `Stats` lazy import (App.tsx, REMOVED) | N/A | Dead import | ✅ YES — removed | N/A | NO | `git restore -- src/App.tsx` |
| `topNavSections.stats` (App.tsx, REMOVED) | `topNavSections.dev` | Duplicate nav authority to same `/dev` | ✅ YES — removed | N/A | NO | `git restore -- src/App.tsx` |
| `uiPages.stats` in `topLevelPageOrder` (REMOVED) | `uiPages.dev` in same array | Duplicate E2E nav target | ✅ YES — removed | N/A | NO | `git restore -- e2e/desktop/page-objects/uiPages.po.js` |
