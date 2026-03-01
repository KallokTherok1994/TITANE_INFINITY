# 03_DISCOVERY_MAP.md — Discovery Map

**Generated:** 2026-02-28T16:13:09Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Structure racine (niveau 1)

```
src/              Frontend TypeScript (React + Tauri hooks)
src-tauri/        Backend Rust (Tauri application)
docs/             Documentation structurée
e2e/              Tests E2E (wdio + playwright)
scripts/          Scripts d'automation
tests/            Polyfills + fixtures
registry/         Event registry (append-only)
proof_packs/      Proof packs (ce répertoire)
memory/           Données mémoire locale
data/             Données statiques
dist/             Build output (vite)
```

## src/ (Ring map)

```
src/types/          Ring 1 — Types stricts
src/constants/      Ring 1 — Constantes
src/engines/        Ring 2 — Logique pure
src/services/       Ring 3 — I/O orchestrés
src/components/     Ring 4 — UI
src/modules/        Ring 4 — Modules fonctionnels
src/pages/          Ring 4 — Pages React
src/features/       Ring 4 — Features (governance-center, etc.)
src/hooks/          Ring 4 — Hooks React
src/core/           Ring 2/3 — Noyau cognitif
```

## src-tauri/ structure

```
src-tauri/src/         Rust sources
src-tauri/capabilities/ Tauri capabilities JSON
src-tauri/allowlist.whitelist.stable.json  Surface autorisée
src-tauri/tauri.conf.json                  Config principale
src-tauri/Cargo.toml                       Deps Rust
```

## Fichiers de configuration clés

- `vitest.config.ts` — config tests unitaires
- `playwright.config.ts` — config E2E
- `vite.config.ts` — build frontend
- `tsconfig.json` — TypeScript strict
- `eslint.config.js` — ESLint
