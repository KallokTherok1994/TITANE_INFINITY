# UI Desktop Strict Backend Proof Gate — Results v60

**Date**: 2026-05-10
**Session**: `TITANE_UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60`
**Spec files**: 5 (`ui-desktop-strict-backend-proof-*.wdio.test.js`)
**Artifact**: `artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl`

---

## Suite Execution Summary

| Spec | Status | Records |
|---|---|---|
| `ui-desktop-strict-backend-proof-core.wdio.test.js` | ✅ PASS (code=0) | ~12 |
| `ui-desktop-strict-backend-proof-admin-dev.wdio.test.js` | ✅ PASS (code=0) | ~10 |
| `ui-desktop-strict-backend-proof-utility.wdio.test.js` | ✅ PASS (code=0) | ~14 |
| `ui-desktop-strict-backend-proof-agent-chat.wdio.test.js` | ✅ PASS (code=0) | ~10 |
| `ui-desktop-strict-backend-proof-sandbox.wdio.test.js` | ✅ PASS (code=0) | ~7 |
| **TOTAL** | **✅ PASS** | **53** |

---

## Artifact Schema Compliance (Strict Mode)

| Check | Result |
|---|---|
| Total records | 53 |
| All have `sourceSpec` | ✅ true |
| All have `schemaVersion: "v60"` | ✅ true |
| All have `capturedAt` | ✅ true |
| All have `moduleId` | ✅ true |
| All have `tier` | ✅ true |

---

## Proof Level Distribution

| Proof Level | Count |
|---|---|
| `UI_REFLECTS_BACKEND_RESULT` | 12 |
| `SANDBOXED_MUTATION_PROVEN` | 1 |
| `PROOF_DEPTH_GUARDED_ONLY` | 8 |
| `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | 7 |
| `PROOF_DEPTH_BLOCKED_BY_RUNTIME` | 25 |

---

## Strict Verifier Result

```
pnpm run verify:backend-proof-depth:strict
PASS: 6 | WARN: 282 | FAIL: 0
✅ VERDICT: PASS
```

- **WARN 282** = legacy v58/v59 artifacts (`MISSING_SOURCE_SPEC`) — classified WARN not FAIL (not v60 artifacts)
- **v60 artifact in strict mode**: FAIL: 0 ✅
- **Minimum record count (≥10)**: ✅ (53 records)

---

## Gates

| Gate | Result |
|---|---|
| `detect_recurrence.sh` | ✅ PASS (1775 entries) |
| `verify_instructions.sh` | ✅ PASS=52 FAIL=0 |
| WDIO suite (code=0) | ✅ PASS |
| `verify:backend-proof-depth:strict` | ✅ PASS (FAIL:0) |
