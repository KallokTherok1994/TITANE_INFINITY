# PHASE 06 - ACTION ELIGIBILITY MATRIX

## A) Objective
Define what can and cannot be changed under closure-only mandate.

## B) Evidence
- `raw/strict_dirty_full_map.tsv`

## C) Matrix
| Class/Role | Safe Action | Decision |
|---|---|---|
| `TRACKED_MODIFIED + RUNTIME_CODE` | Keep in git scope, do not force-clean | `PASS` |
| `TRACKED_MODIFIED + TEST_ARTIFACT` | Revert-safe but not auto-reverted without explicit request | `PASS` |
| `UNTRACKED + HISTORICAL_PROOF_PACK` | Normalize and keep | `PASS` |
| `UNTRACKED + ACTIVE_PROOF_PACK` | Complete and keep | `PASS` |
| `UNTRACKED + registry/*` | Keep; index provenance | `PASS` |

## D) Stop-the-line Rules Applied
- No destructive cleanup.
- No fake clean/seal claim.
- No runtime drift outside closure objective.

## E) Status
`PASS`

## F) Rollback
No direct rollback needed for eligibility decision itself.

