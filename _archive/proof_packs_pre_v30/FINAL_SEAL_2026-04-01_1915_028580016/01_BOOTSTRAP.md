# 01 BOOTSTRAP

## Requested bootstrap truth

Commands requested by operator:

- `git status --porcelain`
- `git rev-parse --short HEAD`
- `git branch --show-current`
- `git log -20 --oneline`
- `git remote -v`
- `git fetch --all --prune`
- `git rev-parse --short origin/MAIN`
- `node -v`
- `pnpm -v`
- `rustc -V`
- `cargo -V`
- `pnpm -s run | head -200`

## Observed truth

Primary workspace:

- `git fetch --all --prune`: FAIL because remote `fastfs` is invalid
- `git status --porcelain`: dirty, 35 entries
- `HEAD`: `0ff58c9c6`
- `branch`: `MAIN`

Authority fallback:

- `git fetch origin --prune`: PASS
- `origin/MAIN`: `028580016`

Toolchain in isolated worktree:

- `node -v`: `v24.0.0`
- `pnpm -v`: `10.30.2`
- `rustc -V`: `rustc 1.94.0 (4a4ef493e 2026-03-02)`
- `cargo -V`: `cargo 1.94.0 (85eff7c80 2026-01-15)`

## Bootstrap verdict

- Primary tree bootstrap truth: FAIL
- Isolated worktree bootstrap truth: PASS
