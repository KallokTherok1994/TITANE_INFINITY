# 07_ALLOWED_WAKE_PATH

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `wake path selection`

C) RISK: `P1`

D) PLAN (<=7):

1. Select one wake path only if trigger accepted.
2. Define first mandatory step.
3. Define remaining forbidden actions.
4. Define return-to-rest condition.

E) PROOFS:

- Trigger classification:
  - `05_TRIGGER_CLASSIFICATION.md`
- Wake mapping references:
  - `raw/reference_wake_pack.txt`
  - `raw/wake_path_mapping_reference.md`

WAKE_PATH_SELECTED:

- `NONE`

Reason:

- Trigger rejected; no authorized wake path may be launched.

Return-to-rest condition:

- immediate, because no threshold reached.

F) ROLLBACK:

- No path activated, no rollback action beyond pack deletion.
