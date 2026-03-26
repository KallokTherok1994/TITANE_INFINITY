# ROUTE MATRIX

| route | declared target | actual rendered page | redirect? | canonical? | legacy? | verdict |
|-------|----------------|---------------------|-----------|------------|---------|---------|
| `/dev` | `<DevPage />` | DevPage | NO | ✅ YES | NO | CANONICAL |
| `/stats` | `<Navigate to="/dev" replace />` | DevPage (via redirect) | ✅ YES | NO | legacy alias | CANONICAL_REDIRECT |
| `/cognitive` | `<Navigate to="/dev" replace />` | DevPage (via redirect) | ✅ YES | NO | legacy alias | CANONICAL_REDIRECT |
| `/dev` (STATS nav, pre-fix) | `topNavSections id:stats → /dev` | DevPage | NO | ❌ DUPLICATE | VESTIGIAL | **REMOVED — DUPLICATE_NAV_AUTHORITY** |
| DEV tab: System | `DevPage > Diagnostics > StatsSystemPanels` | embedded | NO | ✅ YES | NO | CANONICAL |
