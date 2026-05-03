# 03 WORKSPACE OR WORKTREE DECISION

## Decision

Use isolated worktree.

## Why isolation was mandatory

- Original workspace had 35 dirty entries.
- Existing isolated worktrees were also dirty.
- `git fetch --all --prune` failed because `fastfs` remote is broken.
- Certification cannot mutate an ambiguous dirty tree.

## Isolated authority selected

- Path: `/home/titane-os/Documents/GitHub/TITANE_INFINITY_FINAL_SEAL_20260401_191557`
- Created from: `origin/MAIN`
- Commit: `028580016`
- Status at creation: clean

## Decision verdict

- Primary workspace: rejected for governed execution
- Fresh worktree: accepted as sole execution authority
