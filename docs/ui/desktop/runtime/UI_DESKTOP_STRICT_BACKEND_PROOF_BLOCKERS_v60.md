# UI Desktop Strict Backend Proof — Blockers v60

**Date**: 2026-05-10

## Current Blockers: NONE

All gates pass. v60 strict verifier: PASS: 6 | FAIL: 0.

---

## Known Accepted Limitations (Not Blockers)

### PROOF_DEPTH_BLOCKED_BY_RUNTIME (25 records)

Modules blocked at runtime (no Tauri invoke available in test context) are correctly classified as `PROOF_DEPTH_BLOCKED_BY_RUNTIME`. This is the expected classification when `window.__TAURI__` is unavailable in the specific test route context.

Affected primarily: EXPERIENCE, AGENT_CHAT, cross-navigation IPC attempts.

**Not a blocker**: these are correctly recorded with full v60 schema. The test runner runs without a full Ollama stack, so some IPC commands time out at the backend level.

### Legacy WARNs (282 in strict mode)

All from v58/v59 artifacts (`MISSING_SOURCE_SPEC`). These are WARN, not FAIL, by design in strict mode — only v60 artifacts are fully enforced.

Classification:
- 254 = `LEGACY_V58_ARTIFACT`
- 28 = `LEGACY_V59_ACCEPTED` (some v59 records do have sourceSpec)

**Not a blocker**: documented and tracked in `UI_DESKTOP_BACKEND_PROOF_WARNING_BURNDOWN_v60.md`.

---

## Escalation Path

If a future run produces FAIL in strict mode for the v60 artifact:
1. Run: `wc -l artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl`
2. Run: `TITANE_PROOF_ARTIFACT=artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl node scripts/verify/verify-backend-proof-depth.mjs --strict 2>&1 | grep FAIL`
3. Fix the failing spec or helper and re-run suite
4. Append AutoHeal entry and re-run `detect_recurrence.sh`
