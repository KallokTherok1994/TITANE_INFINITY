# BETA TROUBLESHOOTING — TITANE∞

## Problèmes Courants

### PATH Node Manquant
Erreur: `node: command not found`
Solution: `export PATH="$PWD/.tools/node/current/bin:$PATH"`

### Corepack/Pnpm Non Actif
Erreur: `pnpm: command not found`
Solution: `corepack enable && corepack prepare pnpm@9 --activate`

### Rust/Cargo Manquant
Erreur: `cargo: command not found`
Solution: Installer Rust via rustup.

### Tauri CLI Manquant
Erreur: `tauri: command not found`
Solution: `pnpm install` ou `cargo install tauri-cli`

### Git LFS Non Initialisé
Erreur: Binaires manquants
Solution: `git lfs install && git lfs pull`

### dev:tauri Échoue
Vérifier logs: `pnpm run dev:tauri 2>&1 | tee dev.log`
Chercher 'error' dans dev.log.

### Build Stable Échoue
Vérifier: `cargo check` dans src-tauri/
Puis `./runtime/stable/build.sh`