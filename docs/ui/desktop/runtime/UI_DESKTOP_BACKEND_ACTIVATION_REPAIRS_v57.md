# UI_DESKTOP_BACKEND_ACTIVATION_REPAIRS_v57

**Date**: 2026-05-10  
**Session**: v57 — Backend Activation Reduction

---

## Repairs Applied in v57

### R1 — IPC Guard: oauth_facebook Capability Fix

**File**: `src-tauri/tauri.conf.json`  
**Issue**: `guard:ipc-contract` 41/42 FAIL — 4 oauth_facebook commands absent from capabilities allow list  
**Fix**: Added to `main-capability.allow[]`:
```json
{ "command": "oauth_facebook_initiate" },
{ "command": "oauth_facebook_callback" },
{ "command": "oauth_facebook_get_profile" },
{ "command": "oauth_facebook_logout" }
```
**Result**: `guard:ipc-contract` = 42/42 PASS  
**AutoHeal**: `AH-IPC-OAUTH-FACEBOOK-CAPABILITY-v57-2026`

---

### R2 — E2E Testid Audit: 10 Incorrect Testids Fixed

All testid corrections in activation specs v57:

| Module | Wrong Testid | Correct Testid | Source File |
|---|---|---|---|
| CREATION | `page-creation` | `page-creation-studio` | `src/pages/CreationStudio.tsx` |
| EVOLUTION | `page-evolution` | `page-evolution-monitor` | `src/pages/EvolutionMonitor.tsx` |
| PERFORMANCE | `page-performance` | `page-performance-test` | `src/pages/PerformanceTest.tsx` |
| ORCHESTRATION_CENTER | `page-orchestration-center` | `page-orchestration-meta-center` | `src/pages/OrchestrationMetaCenter.tsx` |
| SINGULARITY | `page-singularity` | `page-singularity-monitor` | `src/pages/SingularityMonitor.tsx` |
| SELFHEAL | route `/self-heal` + `page-self-heal` | route `/selfheal` + `page-selfheal` | `src/pages/SelfHeal.tsx`, `src/App.tsx` |
| ADAPTIVE | `page-adaptive` | `page-adaptive-engine` | `src/pages/AdaptiveEngine.tsx` |
| CLOUD | `page-cloud` | `page-cloud-center` | `src/pages/CloudCenter/index.tsx` |
| RESEARCH | `page-research` | `research-page` | `src/pages/ResearchPage.tsx` |
| DOC_CENTER | `page-doc-center` | `doc-center-page` | `src/pages/DocCenterPage.tsx` |

**Root cause**: v56 testid reference list contained assumed values rather than verified source-file values.  
**Prevention**: For any E2E spec using `navigateAndWait`, verify testid by `grep -n 'data-testid' src/pages/<Page>.tsx` before committing.

---

### R3 — v57 Helper Created

**File**: `e2e/desktop/helpers/uiDesktopBackendActivation.js`  
**Purpose**: Backend activation test utilities — `tryInvoke`, `isTauriAvailable`, `getBodyHTML`, `hasDegradedIndicator`, `hasSimulatedIndicator`, plus re-exports from existing functional helpers.  
**Design**: `tryInvoke` never throws — returns `{ ok, content, error, available }`. Degraded = PASS.
