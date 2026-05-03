# 14 — DUPLICATION MERGE REPORT

## Duplicate proven

- Element kept: `AH-2026-03-17-SEAL-MASTER`
- Element renamed: second duplicate entry describing the pre-repair IPC problem
- New id assigned: `AH-2026-03-17-IPC-INCOMPLETE-REPAIR`
- Justification: two semantically distinct events cannot share one canonical id
- Risk: low; id-only change; all semantic fields preserved
- Proof: detect_recurrence.sh PASS after rename
- Rollback: `git restore -- scripts/autoheal/autoheal_rules.jsonl`

## No other merge/dedup executed

- prompts: none
- instructions: none
- docs: none
- code paths: none
