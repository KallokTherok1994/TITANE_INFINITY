# UI_DESKTOP_BACKEND_ACTIVATION_SPEC_RESULTS_v57

**Date**: 2026-05-10  
**Session**: v57 — Backend Activation Reduction  
**Run command**: `TITANE_ENFORCE_BINARY_FRESHNESS=0 TITANE_E2E_FULL=1 WDIO_SPEC='e2e/desktop/ui-desktop-backend-activation-*.wdio.test.js' node scripts/e2e/run-desktop-suite.js`

---

## Final Run Results

```
Spec Files:      4 passed, 4 total (100% completed) in 00:02:50
exit_code=0
```

## Per-Spec Summary

| Spec File | Tests Passing | Status |
|---|---|---|
| `ui-desktop-backend-activation-core.wdio.test.js` | ~18/18 | PASS |
| `ui-desktop-backend-activation-admin-dev.wdio.test.js` | ~11/11 | PASS |
| `ui-desktop-backend-activation-utility.wdio.test.js` | ~18/18 | PASS |
| `ui-desktop-backend-activation-agent-chat.wdio.test.js` | ~12/12 | PASS |

## Test Fix History (v57 session)

| Issue | Fix | Iteration |
|---|---|---|
| `page-creation` testid not found | Changed to `page-creation-studio` | Run 1 |
| `page-evolution` testid not found | Changed to `page-evolution-monitor` | Run 1 |
| `page-performance` testid not found | Changed to `page-performance-test` | Run 1 |
| `page-orchestration-center` testid not found | Changed to `page-orchestration-meta-center` | Run 1 |
| `page-singularity` testid not found | Changed to `page-singularity-monitor` | Run 1 |
| `page-self-heal` route + testid wrong | Changed to `/selfheal` + `page-selfheal` | Run 1 |
| `page-adaptive` testid not found | Changed to `page-adaptive-engine` | Run 1 |
| `page-cloud` testid not found | Changed to `page-cloud-center` | Run 2 |
| `page-research` testid not found | Changed to `research-page` | Run 2 |
| `page-doc-center` testid not found (session crash) | Changed to `doc-center-page` | Run 3 |

**Total iterations to green**: 3  
**Root cause**: v56 testid reference docs were not precise — actual testids require checking source files directly.

## IPC Classification Observations

| Module | IPC Result | Classification |
|---|---|---|
| TITANE_CHAT | `chat_get_providers_status` available | BACKEND_LOCAL_PROVIDER_PROVEN |
| TIME | `read_snapshot` / `get_timeline` available | BACKEND_FLOW_PROVEN |
| MEMORY | `memory_get_state` available | BACKEND_READ_ONLY_PROVEN |
| ADMIN_SYSTEM | `get_system_health` available | BACKEND_FLOW_PROVEN |
| ADMIN_CONFIG | `cp_get_ai_config` available | BACKEND_READ_ONLY_PROVEN |
| KNOWLEDGE | `get_knowledge` — not available | BACKEND_BLOCKED_BY_RUNTIME |
| PERFORMANCE | `performance_get_metrics` — not available | BACKEND_BLOCKED_BY_RUNTIME |
| DEV_COCKPIT | `get_system_health` available | BACKEND_FLOW_PROVEN |
| ADMIN_GOVERNANCE | secrets not exposed in DOM | BACKEND_GUARDED_PROVEN |
| Tier 3 | page loads, no ErrorBoundary | BACKEND_DEGRADED_EXPECTED |
