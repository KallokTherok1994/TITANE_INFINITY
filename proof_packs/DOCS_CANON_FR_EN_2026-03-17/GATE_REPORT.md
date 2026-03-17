# GATE REPORT — DOCS CANON FR/EN 2026-03-17

**Date:** 2026-03-17

---

## Gate results

| Gate | Command | Result | Notes |
|---|---|---|---|
| detect_recurrence | `bash scripts/autoheal/detect_recurrence.sh` | **PASS** | G_AH_RECURRENCE_GUARD_PASS, 402 entries |
| verify_instructions | `bash scripts/verify_instructions.sh` | **PASS** | PASS=20 FAIL=0 |

---

## Additional fix applied

The pre-existing `AH-2026-03-17-SEAL-MASTER` entry in `scripts/autoheal/autoheal_rules.jsonl` had missing required fields (`scope=null`, no `symptom`, no `commands`, no `files_changed`, no `rollback`). This caused both gates to fail before correction.

**Fix applied:** Missing required fields populated from the entry's existing content (`signature`, `patch` fields).

**Nature:** Pre-existing data integrity issue in governance registry — not caused by docs session changes.

---

## Final gate summary

```
verify_instructions: PASS=20 FAIL=0
detect_recurrence: G_AH_RECURRENCE_GUARD_PASS (402 entries)
```
