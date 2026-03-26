# Bootstrap verifie

Contexte machine et depot verifie avant toute nouvelle classification.

## Valeurs constatees

- Depot: `/home/titane-os/Documents/GitHub/TITANE_INFINITY`
- Utilisateur: `titane-os`
- Branche: `MAIN`
- HEAD: `b376fe900`
- Node: `v24.14.0`
- pnpm: `10.30.2`
- rustc: `1.94.0`
- cargo: `1.94.0`
- tauri-cli: `2.9.6`

## Etat git

- Worktree tres sale.
- `MAIN` est en avance de 1 commit sur `origin/MAIN`.
- Les tags locaux les plus recents s'arretent a `v28.6.0`; le tag local `v28.88.0` n'est pas prouve.

## Commandes bootstrap

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
```
