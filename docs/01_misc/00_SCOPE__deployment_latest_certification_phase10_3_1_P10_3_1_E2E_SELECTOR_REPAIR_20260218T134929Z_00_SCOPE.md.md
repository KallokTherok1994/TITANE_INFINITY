# P10.3.1 E2E Selector Repair — Scope

**Authorization**: GO_FIX_E2E_SELECTORS__P10_3_1__TITANE_INFINITY  
**Goal**: Fix Desktop E2E selector mismatch, rerun P10.3 Phase E, seal  
**Max Iterations**: 3 selector fix attempts  
**Allowed Files**:
- e2e/desktop/** (E2E test files)
- src/** (UI components for testid only)
- scripts/e2e/** (optional helpers)
- wdio*.conf.* (optional config)

**Forbidden**:
- src-tauri/** 
- pnpm-lock.yaml changes
- dependency installs
- guard bypass
- dev server

**Phases**:
1. A: Create proof pack
2. B: Capture failure + locate targets (read-only)
3. C: DOM evidence (automated)
4. D: Fix strategy iteration loop (max 3)
5. E: Rerun P10.3 Phase E (E2E x3 + scans)
6. F: Seal + Registry + Commit

---

**Current Failure**: `.chat-bubble-trigger` selector not found in E2E Run 1  
**Root Cause**: Chat component selector class mismatch (pre-existing E2E issue)  
**Impact on Transport Patch**: ZERO (ollama.ts patch is GOOD)

---

## Files Staged for Creation
- 01_PRECHECKS.txt ✓
- 02_FAILURE_EVIDENCE.txt (Phase B)
- 03_DOM_EVIDENCE_RUN1.md (Phase C)
- 04_SELECTOR_PLAN.md (Phase B)
- 05_PATCH_DIFF.txt (Phase D)
- 06_E2E_SELECTOR_FIX_ITER_1.md (Phase D)
- 06_E2E_SELECTOR_FIX_ITER_2.md (Phase D)
- 06_E2E_SELECTOR_FIX_ITER_3.md (Phase D)
- 07_RERUN_P10_3_E2E_X3.md (Phase E)
- VERDICT.md (Phase F)
- LOCK.md (Phase F)
- SHA256SUMS.txt (Phase F)
- ROLLBACK.md (Phase F)
- COMMANDS_RUN.txt (Phase F)
- ENV.txt (Phase F)

