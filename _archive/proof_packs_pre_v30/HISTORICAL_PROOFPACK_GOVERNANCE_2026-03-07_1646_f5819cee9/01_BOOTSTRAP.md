# PHASE 0 - BOOTSTRAP HISTORICAL RESIDUE TRUTH

## Mandatory Captures

Captured in `raw/`:

- `git status --short` -> `raw/git_status_short.txt`
- `git status` -> `raw/git_status.txt`
- `git rev-parse --short HEAD` -> `raw/head_short.txt`
- `git log -5 --oneline` -> `raw/git_log5.txt`
- `git ls-files --others --exclude-standard` -> `raw/untracked_all.txt`
- `git status -sb` -> `raw/git_status_sb.txt`
- `find proof_packs -maxdepth 3 -type f | sort` -> `raw/proof_packs_find.txt`
- `du -sh proof_packs/* | sort -h` -> `raw/proof_packs_du.txt`

## Baseline Truth (Phase 0)

- `tracked_modified_count=0`
- `staged_count=0`
- `untracked_count=1011`
- `historical_untracked_count=1011`
- Branch state at bootstrap: `MAIN...origin/MAIN [devant 3]`

## Lane Objective

Govern historical untracked residue with explicit local-only policy and index/manifest normalization, then recalculate push-readiness without reopening Bucket A/Bucket C logic.

## Main Risk

False governance confidence from silent omission or ambiguous classification across high-volume proof-pack residue.

## Next Action (<=30 min)

Load prior lane authority (`UNTRACKED_RESIDUE_CLEARANCE`) and freeze blocker semantics before any policy mutation.

