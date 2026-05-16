# TITANE∞ — Documentation Index

> **Version:** v35.1.6 — Mise à jour 2026-05-16

## Guides essentiels

| Document | Description |
|----------|-------------|
| [`../README.md`](../README.md) | Vue d'ensemble, audit status, démarrage rapide |
| [`../DEVELOPER_SETUP.md`](../DEVELOPER_SETUP.md) | Installation développeur complète |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Historique des versions (v28→v35) |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Guide de contribution et gouvernance |
| [`../AGENTS.md`](../AGENTS.md) | Règles pour agents IA (Claude, Copilot, Codex) |
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | Architecture détaillée (4-Ring, IPC, moteurs) |

## Frontend UI/UX (v35.1.6 — Design System v2)

| Document | Description |
|----------|-------------|
| [`ui/ui-ux-research-notes.md`](ui/ui-ux-research-notes.md) | Notes de recherche UX (Apple HIG, Nielsen, WCAG 2.2) |
| [`../.claude/frontend-ui-ux-guidelines.md`](../.claude/frontend-ui-ux-guidelines.md) | Guidelines design system — référence authoritative |

**État du design system :**
- Tokens sémantiques `titanium-*` — toutes les classes branchées sur `var(--color-*)`
- Light mode complet via `UIThemeProvider` + `html.light`
- ARIA tablist (ArrowKey, aria-selected, tabIndex) sur tous les tablists
- `prefers-reduced-motion` gating sur toutes les animations
- Zéro import `@themes/tokens` en production

## Architecture et cartographie

| Document | Description |
|----------|-------------|
| [`00_SYSTEME/`](00_SYSTEME/) | Documentation système centrale |
| [`01_architecture/`](01_architecture/) | Specs d'architecture |
| [`02_ARCHITECTURE/`](02_ARCHITECTURE/) | Architecture par module |
| [`03_REPO_TAXONOMY.md`](03_REPO_TAXONOMY.md) | Taxonomie du repo |
| [`../UI_SURFACE_MAP.md`](../UI_SURFACE_MAP.md) | Cartographie des surfaces UI |
| [`../OLLAMA_RUNTIME_MAP.md`](../OLLAMA_RUNTIME_MAP.md) | Surface Ollama Dev |

## Guides de développement

| Document | Description |
|----------|-------------|
| [`04_guides/quickstart/`](04_guides/quickstart/) | Démarrage rapide |
| [`04_guides/development/`](04_guides/development/) | Guides de développement |
| [`04_guides/features/`](04_guides/features/) | Documentation des features |
| [`04_guides/advanced/`](04_guides/advanced/) | Guides avancés |
| [`05_modules/backend/`](05_modules/backend/) | Documentation modules Rust |
| [`05_modules/frontend/`](05_modules/frontend/) | Documentation modules React |
| [`06_api/`](06_api/) | Référence API (TypeDoc) |

## Gouvernance et certification

| Document | Description |
|----------|-------------|
| [`04_AUTHORITY_MATRIX.md`](04_AUTHORITY_MATRIX.md) | Matrice d'autorité |
| [`06_SEAL_LEDGER.md`](06_SEAL_LEDGER.md) | Registre des seals |
| [`07_PROOF_LEDGER.md`](07_PROOF_LEDGER.md) | Registre des preuves |
| [`11_PROOF_PACK_INDEX.md`](11_PROOF_PACK_INDEX.md) | Index des proof packs |
| [`../proof_packs/`](../proof_packs/) | Tous les proof packs de certification |

## Releases

| Document | Description |
|----------|-------------|
| [`../RELEASE_SURFACE_INVENTORY.md`](../RELEASE_SURFACE_INVENTORY.md) | Inventaire des releases |
| [`release-history/checksums/INDEX.md`](release-history/checksums/INDEX.md) | Checksums historiques |

---

## Résumé état courant

| Attribut | Valeur |
|----------|--------|
| Version | v35.1.6 |
| Date seal | 2026-05-16 |
| Commits | `558119238` (seal) + `d19007bda` (agents) |
| Tests Vitest | 9471/9471 PASS |
| Build Vite | ✅ 17.27s |
| TypeScript | ✅ 0 erreur |
| ESLint | ✅ 0 erreur |
| Backup branch | `backup/frontend-before-ui-redesign` |
| Proof pack | `proof_packs/frontend-ui-ux-redesign-seal-2026-05-15/` |
