# 01_BOOTSTRAP

## Commandes executees

```bash
pwd
whoami
uname -a
git status --short --branch
git rev-parse --short HEAD
git log -20 --oneline
git branch --show-current
git tag --sort=-creatordate | head -20 || true
node -v || true
pnpm -v || true
rustc -V || true
cargo -V || true
cargo tauri -V || pnpm tauri -V || true
git lfs version || true
```

## Sorties retenues

```text
pwd -> /home/titane-os/Documents/GitHub/TITANE_INFINITY
whoami -> titane-os
uname -a -> Linux TITANE-OS 6.17.0-19-generic ...
git status -> ## MAIN...origin/MAIN [ahead 1] + worktree tres sale
git rev-parse --short HEAD -> b376fe900
git branch --show-current -> MAIN
node -v -> v24.14.0
pnpm -v -> 10.30.2
rustc -V -> rustc 1.94.0 (...)
cargo -V -> cargo 1.94.0 (...)
cargo tauri -V -> tauri-cli 2.9.6
git lfs version -> git: 'lfs' is not a git command
```

## Verite immediate

- bootstrap complet: oui
- baseline numerique visible: `28.88.0`
- V29 deja present quelque part dans le repo: oui, en docs historiques et en etiquettes actives d'UI
- prochaine action sous 30 min executee: verifier la chaine `http_request` puis classer les blockers V29 reels

