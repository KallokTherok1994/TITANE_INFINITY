# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap and baseline link`

C) RISK: `P1`

D) PLAN (<=7):
1. Create `WAKE_PROTOCOL_READY_STATE` pack.
2. Capture required git bootstrap commands.
3. Validate active baseline `STANDBY_CONFIRMED`.
4. Validate canonical baseline `757ae4d4c`.
5. Reference prior sentinel pack.
6. Capture previously validated wake paths.

E) PROOFS:
- Pack: `proof_packs/WAKE_PROTOCOL_READY_STATE_2026-03-07_0815_757ae4d4c`
- Required bootstrap captures:
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_status_short.txt`
- Baseline validation:
  - `raw/check_active_baseline_standby_confirmed.txt`
  - `raw/check_canonical_baseline_757ae4d4c.txt`
- Sentinel references:
  - `raw/sentinel_pack_reference.txt`
  - `raw/sentinel_verdict_reference.md`
  - `raw/sentinel_triggers_reference.md`
  - `raw/sentinel_decision_reference.md`
- Allowed wake paths captured:
  - `raw/authorized_wake_paths_validated.txt`

F) ROLLBACK:
- Delete this pack only if rollback needed.
