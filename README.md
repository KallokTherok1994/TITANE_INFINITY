# TITANE∞ — Cognitive Operating System

[![CI Unified](https://github.com/KallokTherok1994/TITANE_INFINITY/actions/workflows/ci-unified.yml/badge.svg?branch=MAIN)](https://github.com/KallokTherok1994/TITANE_INFINITY/actions/workflows/ci-unified.yml)
[![Version v35.1.6](https://img.shields.io/badge/version-v35.1.6-brightgreen?logo=github)](CHANGELOG.md)
[![License Proprietary](https://img.shields.io/badge/license-Proprietary-lightgrey)](LICENSE.md)

TITANE∞ est un **OS cognitif** sous forme d'application desktop native (Tauri v2 + React 19), conçu comme un assistant IA personnel gouverné, auto-réparateur et évolutif. Il orchestre plusieurs moteurs cognitifs (mémoire triple STM/MTM/LTM, pipeline OMEGA, orchestration multi-providers) derrière une interface desktop soignée, en architecture 4-Ring, avec un backend Rust sécurisé et un frontend React/TypeScript certifié.

---

## Audit Status (v35.1.6 — 2026-05-16)

| Gate                           | Résultat                           |
| ------------------------------ | ---------------------------------- |
| `pnpm run check` (TypeScript)  | **PASS** — 0 erreurs               |
| `pnpm run lint` (ESLint)       | **PASS** — 0 erreurs               |
| `pnpm run test --run` (Vitest) | **PASS** — 9471/9471, 653 fichiers |
| `pnpm run build` (Vite)        | **PASS** — built in 17.27s         |
| Targeted former-failure lanes  | **PASS** — 5 lanes, 370 tests      |

---

## Redesign UI/UX Seal (2026-05-15)

Commit de scellement : `558119238` — _seal(frontend): certify ui ux redesign and repair test gates_

- Light/dark mode complet via `UIThemeProvider` + classe `html.light` + toggle Sun/Moon dans `TopNav`
- Toutes les classes `titanium-*` branchées sur CSS custom properties (`var(--color-*)`)
- 150+ fichiers migrés de classes hardcodées (`text-gray-*`, `bg-slate-*`) vers tokens sémantiques
- A11y : skip-to-content, navigation clavier Arrow/Home/End, `aria-selected`, `role="tab"`, focus ring violet `#a855f7`, `prefers-reduced-motion`
- Animations : 500ms → 200ms, effets décoratifs isolés dans `.dev-only-animations`
- Zéro token `@themes/tokens` (rubis/saphir/emeraude/diamant) en production
- 38 tests réparés, 9 snapshots mis à jour

Proof pack : `proof_packs/frontend-ui-ux-redesign-seal-2026-05-15/VERDICT.md`

---

## Default development system: Windows native

This repository's primary, canonical development rail is **Windows native**. Use PowerShell-first commands and `corepack pnpm` as the canonical package manager. WSL2 and Linux remain supported as fallback and packaging rails; do not share the same working tree between Windows and WSL.

## Installation rapide (PowerShell-first)

```powershell
# Prérequis : Git, Node LTS (see .nvmrc), corepack, pnpm, Rust (MSVC), Visual Studio Build Tools, WebView2
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
corepack enable
corepack pnpm install
Copy-Item .env.example .env  # edit .env if needed
.\scripts\launch\launch-titane.ps1  # recommended PowerShell launcher for dev
```

See [docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md](docs/windows/WINDOWS_PRIMARY_DEV_PROD_GUIDE.md) for the canonical Windows setup and proof gates. For Linux/WSL fallback instructions see the legacy Linux sections lower in this README and [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md).

Voir [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md) pour le guide complet (Linux deps, Ollama, VS Code).

---

## Architecture

TITANE∞ suit un modèle **4-Ring** :

| Ring                  | Responsabilité                                                      |
| --------------------- | ------------------------------------------------------------------- |
| Ring 1 — UI           | React 19, TypeScript 5.9, Tailwind CSS 4.2, Framer Motion, Radix UI |
| Ring 2 — Services     | TanStack Query, Zustand, services IA/mémoire/voix                   |
| Ring 3 — IPC Bridge   | Tauri v2 Commands, protocole sécurisé frontend ↔ Rust               |
| Ring 4 — Moteurs Rust | Pipeline OMEGA, MemoryOS, SecretsEngine, CognitionLayer             |

**Backend Rust** (`src-tauri/src/`) : pipeline OMEGA 10 étapes, Memory OS STM/MTM/LTM, SecretsEngine AES-256-GCM, conversation engine, 20+ modules de commandes Tauri.

**Frontend React** (`src/`) : 13 pages principales, 9 moteurs cognitifs, design system Titanium Dark, composants Radix UI accessibles.

---

## Développement

```bash
pnpm run dev            # Lancer en mode développement
pnpm run check          # Vérification TypeScript (tsc --noEmit)
pnpm run lint           # ESLint
pnpm run test --run     # Tests Vitest (mode non-interactif)
pnpm run build          # Build Vite production
pnpm run format:check   # Vérification Prettier
pnpm vitest run <file>  # Run un fichier de test spécifique
```

Build natif Tauri (on-demand) :

```bash
cargo tauri build --config src-tauri/tauri.conf.json
```

---

## Documentation

| Document                                                                           | Description                             |
| ---------------------------------------------------------------------------------- | --------------------------------------- |
| [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md)                                           | Installation complète, prérequis, IDE   |
| [CHANGELOG.md](CHANGELOG.md)                                                       | Historique des versions                 |
| [CONTRIBUTING.md](docs/00_core/CONTRIBUTING.md)                                    | Guide de contribution                   |
| [docs/ui/DESIGN_SYSTEM.md](docs/ui/DESIGN_SYSTEM.md)                               | Référence design system                 |
| [docs/ui/ui-ux-research-notes.md](docs/ui/ui-ux-research-notes.md)                 | Notes de recherche UX                   |
| [.claude/frontend-ui-ux-guidelines.md](.claude/frontend-ui-ux-guidelines.md)       | Guidelines design system (contributors) |
| [docs/INDEX_REPO_STRUCTURE.md](docs/INDEX_REPO_STRUCTURE.md)                       | Index structure repo                    |
| [docs/06_api/TAURI_COMMANDS_REFERENCE.md](docs/06_api/TAURI_COMMANDS_REFERENCE.md) | Référence API Tauri                     |

---

## License

**Proprietary** — © 2025-2026 Humain Total / Kevin Thibault. Tous droits réservés.
Voir [LICENSE.md](LICENSE.md) pour les conditions.

**Contact :** [GitHub Issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues) pour les questions techniques.
