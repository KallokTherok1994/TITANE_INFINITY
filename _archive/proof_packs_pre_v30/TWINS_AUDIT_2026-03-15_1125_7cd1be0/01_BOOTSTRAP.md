# 01_BOOTSTRAP

## Commandes exécutées
```
git status          → Sur la branche MAIN, à jour avec origin/MAIN
git rev-parse HEAD  → 7cd1be0 (post-patches; HEAD avant: ca268bad8)
git branch          → MAIN
git log -20         → Dernier commit: ca268bad8 chore(node): upgrade to Node.js v22 LTS
```

## REPO_STATE_SUMMARY
- Version: 28.0.0 (Cargo.toml) / 27.2.0 (tauri.conf.json bundle description)
- Branche: MAIN, synchronisée avec origin/MAIN
- Fichier modifié au départ: `vitest.config.ts` (staged)

## TOOLCHAIN_STATE_SUMMARY
- Rust: rustc 1.70+ (Cargo.toml rust-version = "1.70")
- Node.js: v22.22.1 (via nvm)
- pnpm: available via corepack
- Tauri: 2.0 (tauri.conf.json $schema: tauri.app/config/2.0)

## ARCHITECTURE_SURFACE_SUMMARY
- Ring 4: src/ (UI), src-tauri/ (Tauri/Rust backend)
- Pages: 30+ pages dans src/pages/
- Features: 20 features dans src/features/
- Hooks: 60+ hooks dans src/hooks/
- Services: src/services/api/ (chat, evolution, memory, numericTwin, persona, system, voice)
- Composants: src/components/ (50+ sous-répertoires)
- Commandes Rust: src-tauri/src/commands/ (40+ fichiers)

## INITIAL_RISK_STATEMENT
Le module numeric_twin était déclaré dans lib.rs mais jamais intégré dans
le builder Tauri → 100% des appels IPC twin_* depuis le frontend échouaient
silencieusement. Risque CRITIQUE: fonctionnalité Numeric Twin totalement
inaccessible depuis l'interface utilisateur.
