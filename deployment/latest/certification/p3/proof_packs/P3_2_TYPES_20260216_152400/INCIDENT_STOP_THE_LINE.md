# INCIDENT — STOP-THE-LINE (P3-2)

**Timestamp:** 2026-02-16T15:24:20Z
**Reason:** Evidence integrity; proof-pack files changed unexpectedly.

**Files impacted:**
- reports/ai_local_vΩ3/P3_PROVIDER_ORCH_CERT/P3_1_CONTRACT_20260216_151524/FILES_CHANGED.txt
- reports/ai_local_vΩ3/P3_PROVIDER_ORCH_CERT/P3_1_CONTRACT_20260216_151524/COMMANDS_RUN.txt

**Decision:** Revert both files to HEAD (non-destructive) and regenerate deterministically.

**Note:** `git restore --source=HEAD` failed because proof-pack files are not tracked by git. Proceeding with deterministic regeneration only.
