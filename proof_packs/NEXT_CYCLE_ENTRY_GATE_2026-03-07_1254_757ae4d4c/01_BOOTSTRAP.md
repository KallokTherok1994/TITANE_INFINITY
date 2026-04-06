# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap capture`

C) RISK: `P1`

D) PLAN (<=7):
1. Create `NEXT_CYCLE_ENTRY_GATE` pack.
2. Capture `git rev-parse`, `branch`, `status`, `log`.
3. Capture tracked/staged/untracked snapshots.
4. Verify canonization pack exists.
5. Verify active baseline verdict is `CANON_BASELINE_ESTABLISHED`.
6. Capture canonical commit reference `757ae4d4c`.
7. Capture entry signal source text.

E) PROOFS:
- Git bootstrap:
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_status_short.txt`
  - `raw/git_log_10_oneline.txt`
- Drift/untracked snapshots:
  - `raw/git_diff_name_only.txt`
  - `raw/git_diff_cached_name_only.txt`
  - `raw/git_ls_files_untracked.txt`
- Canon baseline checks:
  - `raw/canon_pack_exists.txt`
  - `raw/canon_VERDICT.md`
  - `raw/canon_DECLARATION.md`
- Canonical commit observed:
  - `raw/git_rev_parse_short.txt` -> `757ae4d4c`
- Entry signal capture:
  - `raw/entry_signal_capture.txt`

F) ROLLBACK:
- No mutation outside this pack.
