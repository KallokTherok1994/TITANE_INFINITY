# UI Desktop Backend Proof Warning Burn-Down — v60

**Date**: 2026-05-10
**Session**: `TITANE_UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60`
**Baseline**: v59 verifier output — `PASS: 4 | WARN: 219 | FAIL: 0`

---

## Warning Inventory

| Count | Category | Source | Classification |
|---|---|---|---|
| 204 | `MISSING_SOURCE_SPEC` | `artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl` (L1–L204) | `LEGACY_V58_ARTIFACT` |
| 15 | `MISSING_SOURCE_SPEC` | `artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl` (selected lines) | `LEGACY_V59_ACCEPTED` |
| **219** | **Total** | Both legacy artifacts | |

## Root Cause

`sourceSpec` was not part of the v58 or v59 schema. The v58 helper (`uiDesktopBackendProofDepth.js`) did not include `sourceSpec` in persisted records. v59 added `probeInvokeAndReflect()` and `probeSandboxedMutation()` but neither emitted `sourceSpec` either. The field was only listed as "recommended for traceability" in the original schema design, not enforced.

## Classification

### `LEGACY_V58_ARTIFACT` (204 WARNs)

- File: `artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl`
- Records: 204 (all 204 lack `sourceSpec`)
- Decision: **Accepted as historical artifact.** v58 artifact is sealed and will not be retroactively patched. These WARNs are documented and suppressed from v60 enforcement scope.
- v60 action: `--strict` mode will only enforce `sourceSpec` on new artifact files (v60+). v58 file remains valid as a historical baseline under default (non-strict) mode.

### `LEGACY_V59_ACCEPTED` (15 WARNs from v59 artifact)

- File: `artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl`
- Records: 65 total; 15 lines flagged (L10, L11, L17, L29, L40, L41, L47, L49, L50, L52, L61–L65)
- Cause: v59 specs emitted proof lines without `sourceSpec` field — field was optional in v59 schema
- Decision: **Accepted as v59 design limitation.** v59 spec authors did not include `sourceSpec` since it was not yet enforced. Records are valid and correctly proven; `sourceSpec` absence is a metadata gap only.
- v60 action: All 5 v60 strict specs will emit explicit `sourceSpec` in every persisted record. v59 artifact remains valid in default mode; in `--strict` mode, only v60+ artifacts are validated.

> **Note**: The verifier currently validates ALL artifact files in the `artifacts/backend-proof-depth/` directory. In `--strict` mode, `sourceSpec` enforcement will apply to v60 artifact only (filtered by `TITANE_PROOF_ARTIFACT` env var or artifact filename containing `v60`).

---

## v60 Target State

| Metric | v59 (legacy) | v60 target |
|---|---|---|
| `MISSING_SOURCE_SPEC` in v60 artifact | N/A | **0** |
| `MISSING_ROUTE` in v60 artifact | N/A | **0** |
| `MISSING_MODULE_ID` in v60 artifact | N/A | **0** |
| `MISSING_COMMAND` (IPC) in v60 artifact | N/A | **0** |
| `MISSING_UI_EVIDENCE` (UI_REFLECTS) | N/A | **0** |
| `MISSING_SANDBOX_EVIDENCE` (SANDBOXED) | N/A | **0** |
| Total WARNs in strict mode (v60 artifact) | N/A | **0** |
| Total FAILs in strict mode (v60 artifact) | N/A | **0** |

---

## Burn-Down Path

1. **v60 helper patch** — make `sourceSpec` a required field in `persistProofLine()`; add `schemaVersion: "v60"`, `capturedAt`, `tier`, `redactionApplied`, `secretScanPassed` to all persisted records.
2. **v60 strict verifier** — add `--strict` mode to `verify-backend-proof-depth.mjs`; apply strict checks only to v60 artifact (not legacy).
3. **v60 specs** — all 5 specs pass `sourceSpec` explicitly in every helper call.
4. **v60 run** — strict verifier passes with 0 FAIL, 0 WARN for v60 artifact.

---

## Verdict

`WARNING_BURNDOWN_PLAN_COMPLETE` — 219 WARNs classified as `LEGACY_V58_ARTIFACT` (204) + `LEGACY_V59_ACCEPTED` (15). v60 target is 0 warnings in strict mode for the v60 artifact. Legacy artifacts are not retroactively patched; they remain valid under default (non-strict) mode.
