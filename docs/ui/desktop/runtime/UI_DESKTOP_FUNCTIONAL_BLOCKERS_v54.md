# UI_DESKTOP_FUNCTIONAL_BLOCKERS_v54

**Version**: TITANE_INFINITY v33.0.11  
**Date**: 2026-05-10  

---

## Active Blockers

### BLOCKER-1: Memory ErrorBoundary in E2E Runtime

| Field | Value |
|---|---|
| ID | BLOCKER_E2E_MEMORY_INIT_v54 |
| Module | Memory (/memory) |
| Spec | ui-desktop-functional-core.wdio.test.js |
| Test | `[v54:core] Memory — /memory > no error boundary on memory page` |
| Symptom | ErrorBoundary triggered on /memory navigation in E2E runtime |
| Root Cause | `LIVE_TAURI_SERVICE_BRIDGE` requires initialized SQLite memory DB. E2E binary launches without data dir init. |
| Production Impact | NONE — works in production runtime |
| Fix | Add E2E setup fixture to initialize memory store before Memory route test |
| Priority | MEDIUM — does not block deployment |
| Pre-existing | YES — not introduced by v54 |

---

### BLOCKER-2: oauth_facebook_initiate IPC Capabilities Gap (PREEXISTING)

| Field | Value |
|---|---|
| ID | BLOCKER_IPC_OAUTH_FACEBOOK_CAPABILITIES_PREEXISTING |
| Module | Security / OAuth |
| Gate | guard:ipc-contract |
| Symptom | `oauth_facebook_initiate` missing from tauri.conf.json capabilities allow list |
| Impact | IPC contract gate fails (1 test) — UI guard test fails |
| Fix | Add `oauth_facebook_initiate` to tauri.conf.json capabilities |
| Priority | LOW — facebook OAuth not actively used in production UI |
| Pre-existing | YES — tracked since v33.0.5 |

---

## Non-Blockers (Context)

- **Agent/Chat context selectors**: `agent-context-display`, `agent-module-context`, `chat-context-module` not found in DOM — classified as `AGENT_CHAT_CONTEXT_PARTIAL_STALE_VISIBLE` for routes where only route_in_dom proves context. Enhancement: add explicit agent context testid selectors.
- **Simulated banner format**: SIMULATED classification works via DOM text scan — could be improved with explicit `data-testid="simulated-disclosure-banner"` for deterministic assertion.
