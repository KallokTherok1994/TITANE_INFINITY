# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap capture`

C) RISK: `P1`

D) PLAN (<=7):
1. Create `SENTINEL_STANDBY_MODE` pack.
2. Capture required git snapshot.
3. Confirm baseline stable reference.
4. Reference previous monitor pack.

E) PROOFS:
- Git captures:
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_status_short.txt`
- Baseline checks:
  - `raw/baseline_reference.txt` -> `baseline_commit=757ae4d4c`, `baseline_status=BASELINE_STABLE`
  - `raw/monitor_pack_exists.txt`
  - `raw/monitor_VERDICT.md`

F) ROLLBACK:
- Bootstrap writes only under this sentinel pack.
