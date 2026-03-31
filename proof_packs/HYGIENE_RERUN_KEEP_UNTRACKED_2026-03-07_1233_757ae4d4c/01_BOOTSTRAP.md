# 01_BOOTSTRAP

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `bootstrap evidence only`

C) RISK: `P1`

D) PLAN (<=7 etapes):
1. Create new hygiene rerun pack.
2. Capture git status/head/branch/log.
3. Capture tracked modified/staged lists.
4. Capture exact untracked list.
5. Isolate proof-packs paths.
6. Verify doctrine source pack exists.
7. Verify baseline verdict KEEP_UNTRACKED.

E) PROOFS:
- Pack path: `proof_packs/HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c`
- Mandatory captures:
  - `raw/git_status_short.txt`
  - `raw/git_rev_parse_short.txt`
  - `raw/git_branch_show_current.txt`
  - `raw/git_log_10_oneline.txt`
- Drift/untracked captures:
  - `raw/git_diff_name_only.txt`
  - `raw/git_diff_cached_name_only.txt`
  - `raw/git_ls_files_modified.txt`
  - `raw/git_ls_files_untracked.txt`
- Doctrine baseline existence:
  - `raw/doctrine_pack_exists.txt`
  - `raw/doctrine_VERDICT.md` -> `DOCTRINE_RESOLVED_KEEP_UNTRACKED`

F) ROLLBACK:
- Bootstrap writes only to this proof pack.
