# TITANE∞ — Référence des Commandes

**Version :** 28.0.0  
**Statut :** PROVEN (toutes les commandes vérifiées dans `package.json` ou fichiers scripts nommés)  
**Date :** 2026-03-17

> Chaque commande listée ici est dérivée des scripts `package.json`, de scripts shell nommés ou de l'outillage vérifiable. Aucune commande inventée.

---

## Prérequis

| Outil | Version requise | Commande de vérification | Statut |
|---|---|---|---|
| Node.js | ≥ 20.x | `node --version` | PROVEN (`.nvmrc` présent) |
| pnpm | ≥ 9.x | `pnpm --version` | PROVEN (`.npmrc` impose pnpm) |
| Rust | édition 2021 | `rustc --version` | PROVEN (`src-tauri/Cargo.toml`) |
| Cargo | stable récent | `cargo --version` | PROVEN |
| Tauri CLI | v2.x | `tauri --version` | PROVEN (`src-tauri/`) |
| Ollama | optionnel | `ollama --version` | OPTIONNEL (modèles locaux) |

---

## 1. INSTALLATION

| Commande | Objectif | Source | Risque |
|---|---|---|---|
| `pnpm install` | Installer toutes les dépendances frontend | `pnpm-lock.yaml` | SÛR |
| `cargo build` (dans `src-tauri/`) | Compiler le backend Rust | `src-tauri/Cargo.toml` | SÛR |

**Note :** `npm install` et `yarn install` sont bloqués — voir `scripts/install/enforce-package-manager.cjs`.

---

## 2. DÉVELOPPEMENT

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run dev` | Lancer le mode dev Tauri (frontend + backend) | `package.json` → `tauri dev` | dev | SÛR |
| `pnpm run dev:tauri` | Lancer Tauri dev avec script de monitoring | `package.json` → `scripts/launch/dev_tauri_monitor.mjs` | dev | SÛR |
| `pnpm run dev:tauri:raw` | Lancer la pile dev locale complète | `package.json` → `scripts/launch/deploy_full_local_dev.sh` | dev | SÛR |
| `pnpm run dev:tauri:no-ollama` | Mode dev sans Ollama | `package.json` | dev | SÛR |

---

## 3. BUILD

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run build` | Construire le frontend (Vite) | `package.json` → `vite build` | dev | SÛR |
| `pnpm run build:prod-safe` | Build frontend avec isolation stricte des scripts | `package.json` | mainteneur | SÛR |
| `pnpm run build:production` | Build production complète (lint + format + ollama + vite) | `package.json` | mainteneur | ATTENTION — déclenche pipeline complet |
| `pnpm run build:tauri:e2e` | Construire le binaire Tauri pour tests E2E | `package.json` | dev/CI | ATTENTION — nécessite gate d'autorisation |

---

## 4. LINT & FORMAT

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run lint` | Vérification ESLint sur `src/**/*.{ts,tsx,js,jsx}` | `package.json` | dev | SÛR |
| `pnpm run lint:fix` | Correction automatique ESLint | `package.json` | dev | SÛR |
| `pnpm run format` | Formater tous les fichiers avec Prettier | `package.json` | dev | SÛR |
| `pnpm run format:check` | Vérification Prettier (sans écriture) | `package.json` | dev/CI | SÛR |
| `pnpm run check` | Vérification TypeScript (`tsc --noEmit`) | `package.json` | dev | SÛR |

---

## 5. TESTS

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run test` | Lancer les tests unitaires (Vitest) | `package.json` | dev | SÛR |
| `pnpm run test:watch` | Tests en mode surveillance | `package.json` | dev | SÛR |
| `pnpm run test:coverage` | Tests avec rapport de couverture | `package.json` | dev | SÛR |
| `pnpm run test:rust` | Tests Rust (`cargo test`) | `package.json` | dev | SÛR |
| `pnpm run test:e2e` | Tests E2E Playwright | `package.json` | dev | ATTENTION — nécessite app en cours |
| `pnpm run e2e:desktop` | Suite E2E desktop WDIO | `package.json` | dev | ATTENTION — nécessite build Tauri |
| `pnpm run test:all` | Tous les suites de tests | `package.json` | CI/mainteneur | ATTENTION |
| `pnpm run test:architecture` | Tests de conformité architecture | `package.json` | dev | SÛR |

---

## 6. VÉRIFICATION / GATES

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run verify` | Vérification complète (lint + format + check + tests) | `package.json` | CI | SÛR |
| `pnpm run verify:tauri-only` | Appliquer la politique runtime Tauri-only | `scripts/verify/enforce-tauri-only.sh` | CI | SÛR |
| `pnpm run verify:online-first` | Appliquer la doctrine online-first | `scripts/verify/enforce-online-first.sh` | CI | SÛR |
| `pnpm run verify:instructions` | Vérificateur d'instructions Copilot | `scripts/verify/verify-copilot-instructions.sh` | CI/dev | SÛR |
| `pnpm run verify:tauri-configs` | Valider la cohérence des configs Tauri | `scripts/verify/validate-tauri-configs.sh` | CI | SÛR |
| `bash scripts/verify_instructions.sh` | Gate d'instructions complet (PASS=20 attendu) | `scripts/verify_instructions.sh` | dev/CI | SÛR |
| `bash scripts/autoheal/detect_recurrence.sh` | Vérifier les récurrences de règles autoheal | `scripts/autoheal/detect_recurrence.sh` | dev/CI | SÛR |

---

## 7. OLLAMA (IA LOCALE)

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run ollama:start` | Démarrer le serveur Ollama | `package.json` → `ollama serve` | user/dev | SÛR |
| `pnpm run ollama:status` | Vérifier le statut Ollama | `package.json` → `curl http://127.0.0.1:11434/api/tags` | user/dev | SÛR |
| `pnpm run ollama:pull` | Télécharger le modèle llama3.2:latest | `package.json` | dev | ATTENTION — télécharge un grand modèle |

---

## 8. REGISTRE & AUDIT

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run registry:log` | Journaliser un événement registre | `package.json` | dev | SÛR |
| `pnpm run registry:snapshot` | Créer un snapshot registre | `package.json` | mainteneur | SÛR |
| `pnpm run audit` | Lancer le pipeline d'audit complet | `package.json` | mainteneur | SÛR |
| `pnpm run auto-heal` | Lancer les scripts auto-heal | `package.json` | mainteneur | ATTENTION |

---

## 9. NETTOYAGE

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run clean` | Nettoyer les artefacts de build | `package.json` | dev | SÛR |
| `pnpm run clean:all` | Nettoyage profond (inclut les caches) | `package.json` | dev | ATTENTION — supprime toutes les sorties de build |

---

## 10. GOUVERNANCE (RESTREINT)

| Commande | Objectif | Source | Audience | Risque |
|---|---|---|---|---|
| `pnpm run gate:all` | Lancer tous les gates de production | `package.json` | mainteneur | ATTENTION |
| `pnpm run gate:prod-boot` | Gate de démarrage production | `package.json` | mainteneur | ATTENTION |
| `pnpm run stopline:latest` | Vérifier le statut stop-the-line | `package.json` | mainteneur | SÛR |
| `bash scripts/gates/g1-no-offline-without-reason.sh` | Gate G1 : pas d'offline sans raison | `scripts/gates/` | CI | SÛR |
| `bash scripts/gates/g3-legacy-divergence.sh` | Gate G3 : vérification divergence legacy | `scripts/gates/` | CI | SÛR |

---

## 11. ROLLBACK

Le rollback s'effectue toujours via `git restore` ciblé :

```bash
# Annuler les changements docs uniquement
git restore -- docs/

# Annuler un fichier spécifique
git restore -- chemin/vers/fichier.ts

# Vérifier ce qui changerait
git diff --name-only
```

---

## 12. NON DISPONIBLE / BLOQUÉ

| Commande | Raison | Statut |
|---|---|---|
| `pnpm run preview` | Bloqué — mode Tauri-only imposé | RESTREINT |
| `pnpm run start` | Bloqué — utiliser `pnpm run dev` à la place | RESTREINT |
| `npm install` / `yarn install` | Bloqué par vérification preinstall | RESTREINT |

---

*Source : `package.json`, répertoire `scripts/` | Généré : 2026-03-17*
