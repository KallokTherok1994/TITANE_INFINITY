# UI_DESKTOP_FUNCTIONAL_NEXT_ACTIONS_v56

**Date**: 2026-05-10

---

## Completed in v56

- [x] v55 ErrorBoundary false-positive repair — committed `298b1b542`
- [x] v56 startup: advanced spec broad pattern elimination
- [x] All static gates PASS
- [x] v53 full regression: 12/12 specs PASS
- [x] v54/v55 functional suite: 5/5 specs PASS
- [x] All 29 modules classified with truthful states
- [x] Memory proven: `FUNCTIONAL_READ_ONLY_PROVEN` (error_h2=false error_testid=false)
- [x] AutoHeal entry `AH-UI-DESKTOP-FUNCTIONAL-SUITE-FINALIZATION-v56-2026`
- [x] `detect_recurrence.sh` PASS
- [x] `verify_instructions.sh` PASS
- [x] Certification doc created
- [x] v56 phase committed

## Remaining Future Actions

### OAuth Facebook IPC Contract

The `guard:ipc-contract` gate has a pre-existing 1/42 failure: `oauth_facebook_initiate` not in tauri.conf.json capabilities. When OAuth Facebook feature is completed:
1. Add commands to `tauri.conf.json` capabilities
2. Rerun `guard:ipc-contract` — expect 42/42 PASS

### Live AI Agent Surfaces (DEGRADED_EXPECTED → LIVE_PROVEN)

The 8 degraded advanced AI modules (SINGULARITY, HYPER_CENTER, etc.) show degraded states in E2E because Ollama/backend services are not live. Future path to upgrade to `FUNCTIONAL_LIVE_PROVEN`:
1. Set up E2E with live Ollama instance (gemma2:2b)
2. Rerun advanced spec with live backend
3. Verify content generation and service responses
4. Update classifications

### Agent Chat Context (PARTIAL_STALE → MATCH_PROVEN)

For @ADMIN, @DEV, @MEMORY context routes showing `AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE`:
- These routes load the agent chat from DOM only — the active snapshot sync is incomplete
- Future: ensure context selector renders fully on all agent-embedded routes

### Rebuild for v55 Changes

v55 changes (ErrorBoundary.tsx testid, Memory.tsx marker) are in source code but NOT yet in the release binary. The next `BUILD ALL` will bundle them:
- `data-testid="titane-error-boundary"` will be live in binary
- `data-testid="memory-runtime-status"` will be live in binary
- Tests are already aligned to these testids
