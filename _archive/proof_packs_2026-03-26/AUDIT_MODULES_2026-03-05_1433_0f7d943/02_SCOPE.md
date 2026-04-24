# 02_SCOPE — Périmètre d'Audit

**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z

---

## Périmètre Couvert

### Modules Inclus dans l'Audit

| #   | Module/Dossier       | Type               | Couverture    |
| --- | -------------------- | ------------------ | ------------- |
| 1   | `src/types/`         | Ring 1             | ✅ Complet    |
| 2   | `src/engines/`       | Ring 2             | ✅ Complet    |
| 3   | `src/services/`      | Ring 3             | ✅ Complet    |
| 4   | `src/components/`    | Ring 4 UI          | ✅ Complet    |
| 5   | `src/lib/`           | Ring 3/4 Infra     | ✅ Complet    |
| 6   | `src/core/`          | Ring 2/3 Core      | ✅ Complet    |
| 7   | `src/os/`            | Ring 4 OS Bridge   | ✅ Complet    |
| 8   | `src-tauri/src/`     | Ring 4 Rust        | ✅ Complet    |
| 9   | `.github/workflows/` | CI/CD              | ✅ Complet    |
| 10  | `scripts/`           | Tooling            | ✅ Partiel    |
| 11  | `e2e/`               | E2E Tests          | ✅ Partiel    |
| 12  | `tests/`             | Unit/Integration   | ✅ Partiel    |
| 13  | `docs/`              | Documentation      | ✅ Structurel |
| 14  | `registry/`          | Event registries   | ✅ Complet    |
| 15  | `proof_packs/`       | Preuves existantes | ✅ Inventorié |

### Modules Exclus (hors périmètre)

| Module               | Raison                         |
| -------------------- | ------------------------------ |
| `node_modules/`      | Dépendances tierces            |
| `target/`            | Artifacts Rust build           |
| `dist/`              | Build outputs                  |
| `.git/lfs/`          | Objets LFS binaires            |
| `deployment/latest/` | Artifacts déploiement compilés |
| `runtime/stable/`    | Runtime binaires               |

---

## Entrypoints Principaux

| Entrypoint    | Chemin                      | Ring    | Description                    |
| ------------- | --------------------------- | ------- | ------------------------------ |
| Frontend main | `src/main.tsx`              | R4      | Entrée React SPA               |
| App root      | `src/App.tsx`               | R4      | Composant root                 |
| Tauri main    | `src-tauri/src/main.rs`     | R4      | Entrée Rust backend            |
| Tauri lib     | `src-tauri/src/lib.rs`      | R4      | Builder + command registration |
| Vite config   | `vite.config.ts`            | CI      | Bundler config                 |
| Tauri config  | `src-tauri/tauri.conf.json` | Runtime | Tauri configuration            |
| Vitest main   | `vitest.config.ts`          | CI      | Test runner config             |
| Playwright    | `playwright.config.ts`      | CI      | E2E test config                |

---

## Versions Clés

| Fichier                           | Version |
| --------------------------------- | ------- |
| `package.json`                    | 27.2.0  |
| `src-tauri/Cargo.toml`            | 27.2.0  |
| `src-tauri/tauri.conf.json`       | 27.2.0  |
| `deployment/latest/MANIFEST.json` | 27.2.0  |

**VERDICT VERSION SYNC: ✅ ALIGNED** (tous à 27.2.0)

---

## Technologies

- **Frontend**: TypeScript strict, React 18, Vite, Tailwind CSS
- **Backend**: Rust (Edition 2021), Tauri v2.0, Tokio async
- **Tests**: Vitest, Playwright (E2E), WDIO (Desktop E2E)
- **Network (Rust)**: reqwest 0.11
- **CI**: GitHub Actions (~40 workflows)
- **Package Manager**: pnpm (10.28.2 déclaré)
- **Node**: 24.x

---

## Architecture 4-Ring (Structure Observée)

```
Ring 1 (Types/Constants)
  src/types/           — interfaces, types TypeScript
  src/constants/       — (inclus dans types/)

Ring 2 (Engines — Logique Pure)
  src/engines/         — 20+ moteurs (aura, cognitive, continuum, etc.)

Ring 3 (Services — I/O Orchestration)
  src/services/        — AI, audio, chat, memory, self-healing
  src/lib/             — tauriClient, security, accessibility
  src/core/            — http client gouverné, bridge, commands

Ring 4 (UI/OS — Interaction)
  src/components/      — React components
  src/pages/           — Pages routes
  src/features/        — Modules fonctionnels
  src/os/bridge/       — Tauri OS bridge wrappers
  src-tauri/src/       — Rust backend (commands, engines)
```
