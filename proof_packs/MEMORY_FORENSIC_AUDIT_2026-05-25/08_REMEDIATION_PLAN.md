# 08 - Remediation Plan

## Priority 1 - Restore Memory Isolation Gate
- Replace or restore `scripts/checks/check_memory_isolation.sh` so `scripts/checks/gate_memory_isolation.sh` executes a real check.
- Use existing candidates as source references: `checks/check_G8_MEMORY_ISOLATION.sh` and `checks/check_G8_MEMORY_ISOLATION.ps1`.
- Acceptance: `C:\Program Files\Git\bin\bash.exe scripts/checks/gate_memory_isolation.sh` exits 0 or emits a real FAIL with actionable details.
- Rollback: `git restore -- scripts/checks/gate_memory_isolation.sh scripts/checks/check_memory_isolation.sh`.

## Priority 2 - Normalize Or Reclassify `registry/repo-events.jsonl`
- Decide whether `registry/repo-events.jsonl` is intended as JSONL or pretty JSON history.
- If JSONL: convert each event to one line and add validator coverage.
- If not JSONL: rename/reclassify or exclude it from JSONL registry validators with a documented exception.
- Acceptance: registry parser can pass without hiding invalid JSONL.
- Rollback: `git restore -- registry/repo-events.jsonl` plus validator changes.

## Priority 3 - Reduce Memory Authority Sprawl
- Add a generated or maintained memory authority allowlist from `MEMORY_AUTHORITY_MAP.md`.
- Classify unknown memory surfaces as `canonical`, `legacy`, `archive`, `test`, or `remove-candidate`.
- Add a gate that fails when new runtime memory surfaces are introduced without classification.

## Priority 4 - Prove Runtime Behavior Effect
- Add a governed test scenario comparing response construction with and without seeded memory context.
- Minimum proof: prompt payload diff plus expected answer content assertion on a deterministic mock provider.
- Full proof: runtime Tauri/E2E lane with screenshot/log proof and model output comparison.
