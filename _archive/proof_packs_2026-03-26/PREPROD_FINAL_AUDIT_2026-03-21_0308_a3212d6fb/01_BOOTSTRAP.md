# 01_BOOTSTRAP

Mandatory bootstrap executed before patching:

- git status
- git rev-parse --short HEAD
- git branch --show-current
- git log -20 --oneline
- git remote -v
- node -v
- pnpm -v
- cargo -V
- rustc -V
- pnpm tauri -v || true

Observed truth:

- branch: MAIN
- head at bootstrap: a3212d6fb
- local branch ahead of origin/MAIN by 15 commits
- workspace had staged and unstaged changes (not auto-reverted)
- toolchain available and coherent for local preprod checks
