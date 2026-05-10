# UI Desktop Backend Proof Tier Thresholds — v60

**Date**: 2026-05-10
**Session**: `TITANE_UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60`
**Config file**: `docs/ui/desktop/runtime/backend-proof-tier-thresholds.v60.json`

---

## Tier 1 — Core User-Facing Modules (Highest bar)

| Module | Min Proof Level | uiEvidence Required |
|---|---|---|
| TITANE_CHAT | `UI_REFLECTS_BACKEND_RESULT` | YES |
| TIME | `UI_REFLECTS_BACKEND_RESULT` | YES |
| MEMORY | `UI_REFLECTS_BACKEND_RESULT` | YES |
| DOC_CENTER | `UI_REFLECTS_BACKEND_RESULT` | YES |
| ADMIN_SYSTEM | `UI_REFLECTS_BACKEND_RESULT` | YES |
| ADMIN_CONFIG | `UI_REFLECTS_BACKEND_RESULT` | YES |
| DEV_COCKPIT | `UI_REFLECTS_BACKEND_RESULT` | YES |
| RESEARCH | `UI_REFLECTS_BACKEND_RESULT` | YES |
| CLOUD | `UI_REFLECTS_BACKEND_RESULT` | YES |
| EXPERIENCE | `UI_REFLECTS_BACKEND_RESULT` | YES |
| AGENT_CHAT | `UI_REFLECTS_BACKEND_RESULT` | YES |

**Forbidden**: `UI_ONLY`, `UNKNOWN`, `IMPLIED_LIVE`, `BUTTON_EXISTS_AS_PROOF`, `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED`

---

## Tier 2 — Secondary Experience Modules (Medium bar)

| Module | Min Proof Level | uiEvidence Required |
|---|---|---|
| TWINS | `IPC_RESPONSE_PROVEN` | NO |
| SKILLS | `IPC_RESPONSE_PROVEN` | NO |
| KNOWLEDGE | `IPC_RESPONSE_PROVEN` | NO |
| CREATION | `IPC_RESPONSE_PROVEN` | NO |
| EVOLUTION | `IPC_RESPONSE_PROVEN` | NO |
| PERFORMANCE | `IPC_RESPONSE_PROVEN` | NO |
| FUSION | `IPC_RESPONSE_PROVEN` | NO |

**Allowed**: also `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` (intentional only, documented)
**Forbidden**: `UI_ONLY`, `UNKNOWN`, `IMPLIED_LIVE`, `BUTTON_EXISTS_AS_PROOF`

---

## Tier 3 — Advanced Infrastructure Modules (Baseline bar)

| Module | Min Proof Level | uiEvidence Required |
|---|---|---|
| HYPER_CENTER | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| REALITY_CENTER | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| QUANTUM_CENTER | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| ORCHESTRATION_CENTER | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| ORCHESTRATION_INTELLIGENCE | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| SINGULARITY | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| SENTINEL | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| WATCHDOG | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| SELFHEAL | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |
| ADAPTIVE | `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED` | NO |

**Allowed**: also `IPC_RESPONSE_PROVEN`, `UI_REFLECTS_BACKEND_RESULT`, `DEGRADED_WITH_UI_PROOF`
**Forbidden**: `UI_ONLY`, `UNKNOWN`, `IMPLIED_LIVE`, `BUTTON_EXISTS_AS_PROOF`

---

## v60 Universal Requirements (all tiers)

| Field | Requirement |
|---|---|
| `schemaVersion` | must be `"v60"` |
| `capturedAt` | ISO 8601 timestamp |
| `sourceSpec` | explicit filename (FAIL in strict if missing) |
| `route` | explicit route path (FAIL in strict if missing) |
| `moduleId` | explicit module ID (FAIL if missing) |
| `redactionApplied` | boolean |
| `secretScanPassed` | boolean |
| Minimum record count | 10 records (strict mode) |
