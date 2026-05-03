# 04 CAMPAIGN MATRIX

| Campaign | Goal | Status | Evidence | Notes |
|---|---|---|---|---|
| B | Real-answer chain proof (non-degraded) | BLOCKED | `raw/01_n2_x3.log` | Latest x3 N2 all `TIMEOUT/timeout-degraded`; no real-answer sample in this rerun set. |
| C | Degraded/fallback truth + deterministic forcing | PASS | `raw/03_n2_forced_offline.log`, `raw/04_wrapper_last.log` | Forced offline deterministic path validated, wrapper received injected env. |
| D | UI/backend alignment truth | PASS | `raw/02_ui_x3.log` | UI x3 PASS with alignment markers and assistant-tag attrs. |
| E | False-pass hardening | PASS | `03_CHANGES_APPLIED.md` + specs diff | Anti-generic, anti-user-echo, branch-aware assertions in place. |
| F | Gate reliability/orchestrator behavior | PARTIAL | `raw/05_g5.log`, `raw/06_g7.log`, `raw/07_runall.log` | Premature exit fixed; orchestration complete, but functional gate fails remain. |
