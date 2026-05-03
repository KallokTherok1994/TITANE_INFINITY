# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap and compatibility checks`

C) RISK: `P1`

D) PLAN (<=7):
1. Create `GOVERNED_IDLE_CHARTER` pack.
2. Capture mandatory git commands.
3. Verify `WAKE_PROTOCOL_READY` active baseline.
4. Verify `STANDBY_CONFIRMED` compatibility remains.
5. Verify canonical baseline `757ae4d4c` remains active.
6. Reference previous wake protocol pack.

E) PROOFS:
- New pack:
  - `proof_packs/GOVERNED_IDLE_CHARTER_2026-03-07_0830_757ae4d4c`
- Mandatory captures:
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_status_short.txt`
- Baseline checks:
  - `raw/check_wake_protocol_ready.txt`
  - `raw/check_standby_confirmed_compatible.txt`
  - `raw/check_wake_baseline_757ae4d4c.txt`
  - `raw/check_sentinel_baseline_757ae4d4c.txt`
- References:
  - `raw/wake_pack_reference.txt`
  - `raw/sentinel_pack_reference.txt`
  - `raw/wake_verdict_reference.md`
  - `raw/sentinel_verdict_reference.md`

F) ROLLBACK:
- Delete this pack only.
