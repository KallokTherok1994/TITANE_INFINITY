# 01 — BOOTSTRAP

## Git Truth

- **SHA:** a9c11fb18 (working tree) / ca268bad8 (at session start)
- **Branch:** MAIN
- **Status git:** modifications locales uniquement sur TwinEvolutionPanel.tsx (patches P2)
- **Log-20 HEAD:** voir git log -20 --oneline

## Toolchain

- Node.js v22 LTS (upgrade prouvé commit `ca268bad8`)
- pnpm (lockfile présent)
- Rust / Cargo (cargo check EXIT 0)
- TypeScript (npx tsc --noEmit EXIT 0)

## Workspace Truth

- `package.json`: présent
- `tsconfig.json`, `tsconfig.node.json`, `tsconfig.test.json`: présents
- `vite.config.ts`: présent
- `src-tauri/Cargo.toml`: présent
- `src-tauri/tauri.conf.json`: présent (twin commands dans allowlist depuis TWINS-001)
- `eslint.config.js`: présent

## Structural Truth

- `src/pages/TwinsPage.tsx`: ✅ PAGE TWINS (PRIMARY TARGET)
- `src/components/twin/`: ✅ TwinEvolutionPanel.tsx + CSS + index.ts
- `src/hooks/`: useTwinIdentity.ts, useTwinEvolution.ts, useTwinBehavior.ts
- `src/services/api/numericTwin.ts`: ✅
- `src/types/numericTwin.ts`: ✅
- `src-tauri/src/numeric_twin/`: mod.rs, twin_commands.rs, operational_twin.rs, creative_mirror.rs, identity_collector.rs, cognitive_modeler.rs, evolution_syncer.rs, therapeutic_synthesizer.rs
- `src-tauri/src/digital_twin_v14_1/`: mod.rs, selfheal.rs (legacy)
- `src-tauri/src/meta_mode_engine/digital_twin_bridge.rs`: bridge meta-mode
- `tests/`, `e2e/`: aucun test twins dédié

## INITIAL_RISK_STATEMENT

- RISK P1 résiduel: twin scope entièrement dépendant du runtime Tauri (non testable en CI pur)
- RISK P2: absence de tests E2E pour la page twins
- RISK P2: useTwinBehavior dead code (hook défini, jamais utilisé)
