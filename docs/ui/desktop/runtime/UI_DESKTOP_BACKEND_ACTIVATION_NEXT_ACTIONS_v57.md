# UI_DESKTOP_BACKEND_ACTIVATION_NEXT_ACTIONS_v57

**Date**: 2026-05-10  
**Session**: v57 — Backend Activation Reduction  
**Current verdict**: `UI_DESKTOP_BACKEND_ACTIVATION_PROVEN_WITH_GUARDED_STATES`

---

## Next Actions for v58+

### NA1 — Real Ollama Response Proof

**Priority**: HIGH  
**Scope**: `ui-desktop-backend-activation-agent-chat.wdio.test.js`  
**Action**: Add conditional test block:
```js
if (ollamaReachable) {
  // Send real chat message, assert response token received
  // Classification: BACKEND_AI_RESPONSE_PROVEN
}
```
**Blocker**: Requires Ollama running with `gemma2:2b` in CI/CD E2E context.

---

### NA2 — Memory Write Proof

**Priority**: MEDIUM  
**Scope**: Memory module (`/memory`)  
**Action**: Invoke `memory_store_item` with a test entry, then read back and verify with `memory_get_state`.  
**Note**: Write is safe (use a test-namespace key, clean up after test).

---

### NA3 — KNOWLEDGE IPC Command Resolution

**Priority**: MEDIUM  
**Scope**: `/knowledge` — `get_knowledge` returns BACKEND_BLOCKED_BY_RUNTIME  
**Action**: Diagnose whether `get_knowledge` needs a different command name or runtime context. If command exists, add to `security.ts` and `tauri.conf.json`.

---

### NA4 — Performance Metrics Runtime Fix

**Priority**: LOW  
**Scope**: `/performance` — `performance_get_metrics` returns BACKEND_BLOCKED_BY_RUNTIME  
**Action**: Confirm `performance_get_metrics` is in the tauri.conf.json allow list. If present, diagnose why it fails at runtime during WDIO execution.

---

### NA5 — Upgrade BACKEND_DEGRADED_EXPECTED Modules

**Priority**: LOW (long-term)  
**Scope**: 8 Tier 3 modules  
**Action**: As orchestration, singularity, sentinel subsystems mature, replace degraded stubs with real IPC commands. Each module will need its own activation spec block.

---

### NA6 — CI/CD Integration

**Priority**: MEDIUM  
**Action**: Add activation suite to the `final:test:100` suite:
```bash
WDIO_SPEC='e2e/desktop/ui-desktop-backend-activation-*.wdio.test.js' node scripts/e2e/run-desktop-suite.js
```
**Note**: Requires Tauri binary to be present. Consider conditional skip if binary absent.

---

### NA7 — Testid Registry

**Priority**: MEDIUM  
**Action**: Create `docs/ui/desktop/TESTID_REGISTRY.md` with complete authoritative testid → route mapping (verified from source). This prevents future testid mismatch cascades.

**Quick index** (from v57 verified sources):

| Route | Testid |
|---|---|
| `/titane` | `page-titane` |
| `/time` | `page-time` |
| `/memory` | `page-memory` |
| `/admin` | `page-admin` |
| `/dev` | `page-dev` |
| `/cloud` | `page-cloud-center` |
| `/research` | `research-page` |
| `/doc-center` | `doc-center-page` |
| `/creation` | `page-creation-studio` |
| `/evolution` | `page-evolution-monitor` |
| `/performance` | `page-performance-test` |
| `/selfheal` | `page-selfheal` |
| `/adaptive` | `page-adaptive-engine` |
| `/orchestration-center` | `page-orchestration-meta-center` |
| `/orchestration-intelligence` | `page-orchestration-intelligence` |
| `/singularity` | `page-singularity-monitor` |
| `/sentinel` | `page-sentinel` |
| `/watchdog` | `page-watchdog` |
| `/twins` | `page-twins` |
| `/skills` | `page-skills` |
| `/knowledge` | `page-knowledge` |
| `/fusion` | `page-fusion` |
| `/hyper-center` | `page-hyper-center` |
| `/reality-center` | `page-reality-center` |
| `/quantum-center` | `page-quantum-center` |
