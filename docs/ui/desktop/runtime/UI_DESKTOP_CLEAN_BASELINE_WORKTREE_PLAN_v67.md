# TITANE UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_v67
## Worktree Clean Baseline Audit — Section H

**Date:** 2026-05-10
**Status:** Full classification and action planning

---

## Modified Files (15 Modified, 9 Untracked, 18 Total Dirty)

### Category 1: Code Changes — v67 Mission (TO COMMIT)

#### Spec: Artifact Lifecycle Implementation
**File:** `M  e2e/desktop/ui-desktop-main-menu-capture-reconciliation.wdio.test.js`
- **Status:** Modified
- **Classification:** COMMIT_AS_V67
- **Reason:** Core implementation of env var support (`TITANE_UI_DESKTOP_ARTIFACT`, `TITANE_ARTIFACT_APPEND`, `TITANE_ARTIFACT_RUN_ID`)
- **Action:** Stage and commit with v67 mission commit
- **Impact:** Enables deterministic artifact handling, blocks accidental v64 pollution

#### Verifier: Sealed/Current Mode Support
**File:** `M  scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs`
- **Status:** Modified
- **Classification:** COMMIT_AS_V67
- **Reason:** Core implementation of CLI args and env var support (`--sealed`, `--current`, `--artifact`, `TITANE_UI_DESKTOP_ARTIFACT_MODE`)
- **Action:** Stage and commit with v67 mission commit
- **Impact:** Enables verifier to distinguish sealed from current artifacts

#### Package Scripts: Script Variants
**File:** `M  package.json`
- **Status:** Modified
- **Classification:** COMMIT_AS_V67
- **Reason:** Added `verify:ui-desktop-main-menu-reconciliation:sealed` and `:current` variants for explicit mode control
- **Action:** Stage and commit with v67 mission commit
- **Impact:** Allows CI and developers to explicitly choose sealed/current verification

**Subtotal v67 Code:** 3 files, all COMMIT_AS_V67

---

### Category 2: Generated/Artifact Drift (PRE-EXISTING, ACCEPT AS GENERATED)

#### Backend Proof Depth Artifacts (v58, v59, v63)
**Files:**
- `M  artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl`
- `M  artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl`
- `M  artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl`

- **Status:** Modified
- **Classification:** PREEXISTING_ACCEPTED_DIRTY
- **Reason:** Backend proof artifacts from pre-v67 missions (v58, v59, v63). These are historical artifacts that may have drifted during CI runs or test executions. Documented in v66 audits.
- **Action:** Do NOT stage/commit. Keep as out-of-scope for v67 mission.
- **Impact:** Non-blocking. These are proof artifacts, not source code. Safe to leave dirty.
- **Note:** Consider future gate to prevent backend artifact drift (out of v67 scope).

**Subtotal:** 3 files, PREEXISTING_ACCEPTED_DIRTY

---

#### Generated UI Docs (v50, Route Inventory)
**Files:**
- `M  docs/ui/desktop/generated/UI_DESKTOP_ACTION_CLASSIFICATION_v50.md`
- `M  docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.json`
- `M  docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.md`
- `M  docs/ui/desktop/generated/UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md`
- `M  docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json`
- `M  docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md`
- `M  docs/ui/generated/UI_ROUTE_INVENTORY.md`

- **Status:** Modified (7 files)
- **Classification:** RESTORE_GENERATED_DRIFT
- **Reason:** Generated documentation from `pnpm run generate:ui-surface-docs` and `pnpm run generate:ui-desktop-manifest`. These may be outdated from v66 gates. Should be regenerated and committed if they represent current state.
- **Action:** Options:
  1. **Preferred:** Run `pnpm run generate:ui-surface-docs && pnpm run generate:ui-desktop-manifest` to refresh, then stage/commit with v67
  2. **Alternative:** Restore from HEAD (discard generation) if not needed for v67
  3. **Accept:** Leave dirty if gates will regenerate them anyway
- **Impact:** Affects CI if gates validate doc freshness
- **Recommendation:** Regenerate in Section J (Final Gates) and let gates handle dirty state

**Subtotal:** 7 files, RESTORE_GENERATED_DRIFT

---

#### Build Artifacts
**Files:**
- `M  src-tauri/Cargo.lock`
- `M  src-tauri/data/ui_theme.json`

- **Status:** Modified
- **Classification:** PREEXISTING_ACCEPTED_DIRTY
- **Reason:** `Cargo.lock` is build-system artifact (dependency lock from Rust builds). `ui_theme.json` is built/cached configuration. Both pre-v67.
- **Action:** Do NOT stage. Restore Cargo.lock from HEAD if it's not intentionally updated.
- **Decision:** Check if Cargo.lock represents legitimate build changes (dependency updates). If yes, document in commit. If no, restore.
- **Recommendation:** Run `git restore src-tauri/Cargo.lock` to align with HEAD (pre-v67 state)

**Subtotal:** 2 files, PREEXISTING_ACCEPTED_DIRTY (Cargo.lock candidate for restore)

---

### Category 3: v67 Audit Documentation (TO COMMIT)

#### v67 Mission Audit Docs Created
**Files:**
- `?? docs/ui/desktop/runtime/UI_DESKTOP_ARTIFACT_DRIFT_DIAGNOSIS_v67.md`
- `?? docs/ui/desktop/runtime/UI_DESKTOP_ARTIFACT_LIFECYCLE_POLICY_v67.md`
- `?? docs/ui/desktop/UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_v67_STARTUP_AUDIT.md`

- **Status:** Untracked
- **Classification:** COMMIT_AS_V67
- **Reason:** v67 mission documentation created by autonomous agent during sections C, D, E (startup audit, drift diagnosis, lifecycle policy)
- **Action:** Stage and commit with v67 mission commit
- **Impact:** Governance documentation for v67 baseline determinism improvements

**Subtotal:** 3 files, COMMIT_AS_V67

---

### Category 4: Pre-v67 Audit Files (TO REMOVE or IGNORE)

#### Old Startup Audit Files (v53, v59)
**Files:**
- `?? docs/ui/desktop/UI_DESKTOP_FULL_SUITE_FINALIZATION_v53_STARTUP_AUDIT.md`
- `?? docs/ui/desktop/UI_DESKTOP_IPC_RESPONSE_REFLECTION_v59_STARTUP_AUDIT.md`

- **Status:** Untracked
- **Classification:** HISTORICAL_AUDIT_ARTIFACTS_SAFE_TO_DELETE
- **Reason:** Pre-v67 mission startup audits (v53, v59). No longer needed for current mission.
- **Action:** Delete or ignore. Optional: add to `.gitignore` pattern `*_STARTUP_AUDIT.md` if these are recurring.
- **Impact:** Clean up. Non-blocking.
- **Recommendation:** Delete to reduce repo clutter

**Subtotal:** 2 files, DELETE_SAFE

---

#### Generated Control Inventory Live File (v50)
**File:** `?? docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_LIVE_v50.json`

- **Status:** Untracked
- **Classification:** GENERATED_LIVE_ARTIFACT_SAFE_TO_DELETE
- **Reason:** Live control inventory snapshot, likely generated during test runs. Not source of truth.
- **Action:** Delete or ignore
- **Impact:** Clean up. Non-blocking.
- **Recommendation:** Delete

**Subtotal:** 1 file, DELETE_SAFE

---

### Category 5: v67 Transient Artifacts (CLEANUP/IGNORE)

#### v67 Smoke Artifact
**File:** `?? artifacts/ui-desktop/v67-main-menu-smoke.jsonl`

- **Status:** Untracked
- **Classification:** TRANSIENT_SMOKE_ARTIFACT_SAFE_TO_DELETE
- **Reason:** Created by Section G reproducibility test. Ephemeral, used to verify v64 immutability.
- **Action:** Delete before final commit (post Section J gates)
- **Impact:** Transient testing artifact. Clean up to maintain clean baseline.
- **Recommendation:** Delete after verification gates (Section J)

**Subtotal:** 1 file, DELETE_BEFORE_COMMIT

---

### Category 6: Data Directories (PARTIAL CLEANUP)

#### Research Cache and Index
**Directories:**
- `?? data/research/cache/`
- `?? data/research/index/`

- **Status:** Untracked
- **Classification:** VOLATILE_CACHE_DATA_PARTIAL_IGNORE
- **Reason:** Research cache and index directories. Volatile, may contain temporary data or LLM/search artifacts. Safe to ignore locally but risky to commit.
- **Action:** Add precise `.gitignore` entries:
  ```
  /data/research/cache/
  /data/research/index/
  ```
- **Decision:** Do NOT add broad `/data/` ignore. Only specific volatile subdirectories.
- **Impact:** Prevents future cache/index accumulation from being tracked
- **Recommendation:** Add to `.gitignore`, then delete local copies

**Subtotal:** 2 directories, ADD_TO_GITIGNORE

---

## Worktree Hygiene Plan

### Phase 1: Code Changes (COMMIT)
**Files to stage:**
```
e2e/desktop/ui-desktop-main-menu-capture-reconciliation.wdio.test.js
scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs
package.json
```

**Audit Docs to stage:**
```
docs/ui/desktop/UI_DESKTOP_DETERMINISTIC_ARTIFACTS_CI_CLEAN_BASELINE_v67_STARTUP_AUDIT.md
docs/ui/desktop/runtime/UI_DESKTOP_ARTIFACT_DRIFT_DIAGNOSIS_v67.md
docs/ui/desktop/runtime/UI_DESKTOP_ARTIFACT_LIFECYCLE_POLICY_v67.md
```

**Action:** Will be staged in Section N (Commit Rule)

---

### Phase 2: Generated Docs (REGENERATE or ACCEPT)
**Files:**
```
docs/ui/desktop/generated/*.md (7 files)
docs/ui/generated/*.md (1 file)
```

**Decision:** 
- **Option A (Preferred):** Regenerate via `pnpm run generate:ui-surface-docs` + `pnpm run generate:ui-desktop-manifest` in Section J (Final Gates)
- **Option B:** Restore from HEAD with `git restore docs/ui/`
- **Option C:** Accept dirty and let CI gates regenerate

**Recommendation:** Option A — regenerate in Section J gates, then stage/commit if refreshed

---

### Phase 3: Build Artifacts (RESTORE or ACCEPT)
**Files:**
```
src-tauri/Cargo.lock
src-tauri/data/ui_theme.json
```

**Decision:**
- **Cargo.lock:** Check if intentional build update. If not, restore: `git restore src-tauri/Cargo.lock`
- **ui_theme.json:** Acceptable to leave dirty (configuration cache). Or restore if not needed.

**Recommendation:** Run `git restore src-tauri/Cargo.lock` to align with v66

---

### Phase 4: Delete/Ignore Transient Artifacts
**Delete before final commit:**
```
artifacts/ui-desktop/v67-main-menu-smoke.jsonl
docs/ui/desktop/UI_DESKTOP_FULL_SUITE_FINALIZATION_v53_STARTUP_AUDIT.md
docs/ui/desktop/UI_DESKTOP_IPC_RESPONSE_REFLECTION_v59_STARTUP_AUDIT.md
docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_LIVE_v50.json
```

**Add to `.gitignore`:**
```
/data/research/cache/
/data/research/index/
```

---

### Phase 5: Backend Proof Artifacts (ACCEPT DIRTY)
**Files:**
```
artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl
artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl
```

**Classification:** PREEXISTING_ACCEPTED_DIRTY — documented in v66, safe to leave out-of-scope for v67

---

## Worktree Impact Summary

| Category | Files | Action | Impact | Blocking? |
|---|---|---|---|---|
| v67 Code Changes | 3 | COMMIT | Critical fixes | ✗ |
| v67 Audit Docs | 3 | COMMIT | Governance | ✗ |
| Generated Docs | 7 | REGENERATE/RESTORE/ACCEPT | Documentation | ✗ (gates will handle) |
| Build Artifacts | 2 | RESTORE/ACCEPT | Non-blocking | ✗ |
| Transient (v67) | 1 | DELETE | Clean | ✗ |
| Transient (Pre-v67) | 3 | DELETE | Clean | ✗ |
| Data Dirs | 2 | IGNORE (.gitignore) | Policy | ✗ |
| Backend Proofs | 3 | ACCEPT DIRTY | Out-of-scope | ✗ |
| **Total** | **24** | **Planned** | **7 commit, 1 delete-before-commit, 2 restore, 7 regenerate, 2 ignore, 3 accept** | **✗ NO BLOCKERS** |

---

## .gitignore Policy Update

**Add to `.gitignore`:**
```gitignore
# v67 — Volatile research cache and index
/data/research/cache/
/data/research/index/

# Transient E2E smoke artifacts
/artifacts/ui-desktop/current-*.jsonl
/artifacts/ui-desktop/v*-*-smoke*.jsonl
```

**Rationale:**
- Research cache/index are volatile, should not be committed
- Transient smoke artifacts are ephemeral testing files
- Sealed artifacts (v64-main-menu) remain tracked (no ignore)

---

## Actions for Sections I-N

**Section I (CI Hardening):**
- No worktree impact expected from CI workflow review

**Section J (Final Gates):**
- May regenerate docs/ui/desktop/generated/ files
- May create new gate result files (temporary)
- All gate-generated files to be deleted or restored before commit

**Section H Outcome:**
- ✓ Full classification complete
- ✓ No critical blockers
- ✓ Cleanup plan ready for Section N commit phase
- ✓ .gitignore policy defined
- ✓ Worktree baseline ready for deterministic commit

---

## Verdict (Worktree Hygiene Phase)

**Status:** ✓ AUDIT COMPLETE, PLAN READY
- 24 dirty files fully classified
- 6 files to commit (3 code + 3 docs)
- 7 files to regenerate (gates will handle)
- 4 files safe to delete/restore
- 2 directories to ignore (.gitignore)
- 3 backend proofs accepted dirty (pre-existing)
- No blocking issues
- Clean baseline achievable

**Classification:** UI_DESKTOP_WORKTREE_HYGIENE_AUDIT_COMPLETE_CLEANUP_READY

---

## Execution Timeline
- **Startup Audit (C):** ✓ COMPLETE
- **Drift Diagnosis (D):** ✓ COMPLETE
- **Artifact Lifecycle Policy (E):** ✓ COMPLETE
- **Deterministic Handling (F):** ✓ COMPLETE
- **Reproducibility Test (G):** ✓ COMPLETE
- **Worktree Audit (H):** ✓ COMPLETE (current doc)
- **CI Hardening (I):** → TODO
- **Final Gates (J):** → TODO
- **AutoHeal (K):** → TODO
- **Certification (L):** → TODO
