# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap and evidence capture`

C) RISK: `P1`

D) PLAN (<=7):
1. Create `IDLE_REENTRY_AFTER_TRIGGER_REJECTION` pack.
2. Capture mandatory git context.
3. Verify canonical baseline remains `757ae4d4c`.
4. Verify previous run verdict is `TRIGGER_REJECTED`.
5. Reference complementary active states.
6. Capture raw rejection evidence from previous run.

E) PROOFS:
- Mandatory git captures:
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_status_short.txt`
- Baseline and verdict checks:
  - `raw/check_baseline_from_activation.txt`
  - `raw/check_baseline_from_idle.txt`
  - `raw/check_prev_verdict_trigger_rejected.txt`
- Complementary state checks:
  - `raw/check_state_standby_confirmed.txt`
  - `raw/check_state_wake_protocol_ready.txt`
  - `raw/check_state_governed_idle_confirmed.txt`
- Previous rejection raw evidence:
  - `raw/prev_trigger_signal_capture.txt`
  - `raw/prev_threshold_validation.md`
  - `raw/prev_activation_decision.md`
  - `raw/prev_verdict.md`

F) ROLLBACK:
- Delete this reentry pack only.
