# ROOT CAUSE

## Core Cause
The closure lane succeeded in normalizing proof-pack completeness and registries, but global seal/commit readiness remains blocked because the repository still has mixed dirty scope:
- 13 tracked runtime/UI/config modifications
- 30 untracked paths total (27 proof packs + 3 registry files)

## Why This Blocks Seal
Global seal requires clean-tree truth. Current state is intentionally non-clean and correctly reported as such.

## Why This Blocks Commit
A safe commit boundary is not yet operator-selected across mixed runtime and closure assets.

## Evidence
- `raw/gate_git_status_short.log`
- `raw/final_dirty_recalc.env`
- `raw/git_diff_name_only.txt`

## Status
`BLOCKED`
