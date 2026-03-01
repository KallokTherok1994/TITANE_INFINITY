# 02_REPO_MAP

## Entrypoints principaux
- Frontend: `src/main.tsx`
- Styles bootstrap: `src/index.css`
- Tauri backend: `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`
- Config Tauri: `src-tauri/tauri.conf.json`, `src-tauri/tauri.base.json`

## Surfaces de commande
- Scripts npm/pnpm: `package.json` (inventaire massif)
- Workflows CI: `.github/workflows/*` (46 fichiers détectés)
- Hooks git: `.husky/*` (hooks standard + hooks custom)

## Zones structurantes
- Ring 1/2/3/4 côté TS: `src/types`, `src/engines`, `src/services`, `src/modules|components|pages`
- Backend Rust: `src-tauri/src/*` (modules AI, memory, commands, handlers)
- Scripts opérationnels: `scripts/**`
- Docs et historiques: racine + `docs/**`

## Preuves
- `proof_logs/phase2_inventory_hooks_scripts_entrypoints.log`
- `proof_logs/phase1_dependencies.log`
