# RUNTIME RESULTS

## Dev server
**Server:** Vite 7.3.1, Node.js 22.22.1 (via ~/.nvm/versions/node/v22.22.1)
**Port:** 4000 (pre-existing session server)
**Status:** RUNNING ✅

## Route probes (curl)
| Route | HTTP response | SPA behavior |
|-------|--------------|--------------|
| `/` | 200 | Vite SPA root |
| `/dev` | 200 | DevPage canonical |
| `/stats` | 200 | React Router → Navigate to /dev |
| `/cognitive` | 200 | React Router → Navigate to /dev |

(All routes return 200 in Vite SPA mode — routing is client-side via React Router)

## Bundle analysis (compiled App.tsx via @fs endpoint)
- `nav-stats` testid in compiled bundle: **0 occurrences** ✅
- `'STATS'` label in nav section: **0 occurrences** ✅
- `id: 'dev'` canonical nav entry: present ✅

## Playwright E2E — engine-navigation.spec.ts (updated)
**Command:** `TITANE_E2E_PORT=4000 TITANE_E2E_FULL=1 npx playwright test e2e/critical/engine-navigation.spec.ts`
**Result:** 8 passed (36.3s) ✅

Tests verified:
1. all 9 engines are represented in UI ✅
2. **can navigate between different sections** (nav-dev click → /dev URL) ✅
3. system health indicator is accessible ✅
4. orchestrator controls are present ✅
5. memory system is referenced ✅
6. emotion engine integration ✅
7. **navigation preserves state** (nav-dev used, not nav-stats) ✅
8. engine status updates are real-time ✅

## G_RUNTIME_UI_PASS: PASS ✅
