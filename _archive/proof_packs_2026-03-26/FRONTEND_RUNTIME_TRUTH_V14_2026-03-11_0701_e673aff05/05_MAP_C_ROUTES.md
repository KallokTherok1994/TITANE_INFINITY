# 05 MAP C - ROUTES

## All Routes (App.tsx, HEAD e673aff05, post-V13)

| path | component | notes |
|------|-----------|-------|
| / | Navigate("/titane") | root redirect |
| /titane | TitanePage | main |
| /stats | StatsPage | |
| /time | TimePage | |
| /admin | AdminPage | |
| /dev | DevPage | |
| /fusion | FusionPage | |
| /optimization | OptimizationPage | |
| /orchestration-center | OrchestrationCenterPage | canonical |
| /meta-center | Navigate("/orchestration-center") | SINGLE (V13 removed duplicate) |
| * | Navigate("/titane") | fallback |

## V13 Fix Confirmation
- Before V13: TWO Routes with path="/meta-center" (second at ~line 1136)
- After V13: ONE Route with path="/meta-center" (kept canonical at ~line 1092)
- Fix commit: e673aff05

## Status: PASS - no duplicate routes
