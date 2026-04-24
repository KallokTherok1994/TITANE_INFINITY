# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap gate`

C) RISK: `P1`

D) PLAN (<=7):

1. Create activation pack folder.
2. Capture mandatory git bootstrap facts.
3. Verify canonical baseline stays `757ae4d4c`.
4. Verify complementary active states are present.
5. Capture raw source signal for potential wake.

E) PROOFS:

- Mandatory captures:
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_status_short.txt`
- Canon baseline checks:
  - `raw/check_baseline_757ae4d4c_from_wake.txt`
  - `raw/check_baseline_757ae4d4c_from_sentinel.txt`
  - `raw/check_baseline_757ae4d4c_from_idle.txt`
- Complementary state checks:
  - `raw/check_state_standby_confirmed.txt`
  - `raw/check_state_wake_protocol_ready.txt`
  - `raw/check_state_governed_idle_confirmed.txt`
- Trigger raw capture:
  - `raw/trigger_signal_capture.txt`
  - `raw/trigger_signal_origin_current_idle_signals.txt`

F) ROLLBACK:

- Delete activation pack only.
