# 13_FIX_PLAN — Plan de Correction Optimal
**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z  
**Mode:** PLAN ONLY — NE PAS IMPLÉMENTER sans validation

---

## Objectifs Top 10

1. **Sécurité/Surface réseau**: Éliminer surfaces non gouvernées (Ring 2 HTTP, bridges directs)
2. **Cohérence 4-Ring**: Déplacer I/O des Ring 2 vers Ring 3
3. **IPC canonique**: Unifier tous les invoke() via tauriClient
4. **Fallback local**: Documenter et valider le circuit breaker Ollama
5. **Qualité (lint/tests/build)**: Débloquer l'environnement CI local (pnpm + GTK)
6. **Taille repo**: Réduire les 272MB d'artifacts deployment et 179MB docs
7. **Docs truth & proof**: Mettre à jour la cartographie MAP après corrections
8. **Workflows CI**: Nettoyer les 40+ workflows (beaucoup sont décoratifs/cosmiques)
9. **AutoHeal**: Capturer chaque fix dans `autoheal_rules.jsonl`
10. **Runtime reqwest**: Mettre à jour reqwest 0.11 → 0.12 (security patch)

---

## Lane-UI (EXP) — UI/Docs/Mermaid

| ID | Priorité | Ring | Fichiers Ciblés | Problème | Correction Minimale | Preuve DONE | Risque | Rollback | Statut |
|----|----------|------|-----------------|---------|---------------------|-------------|--------|----------|--------|
| FIX-007 | P2 | R4 | `src/components/sections/ConversationSection.tsx`, `src/pages/ResearchPage.tsx` | URLs externes construites et passées à IPC — vérifier qu'elles ne sont pas utilisées directement via fetch | Ajouter commentaire explicite + vérifier que `target_url` est passée à `invoke()` uniquement | `grep -n "fetch\|axios" ConversationSection.tsx` = 0 occurrences | Faible | `git restore -- src/components/sections/ConversationSection.tsx` | PROPOSED |
| FIX-008 | P2 | R4 | `src/features/governance-center/components/APIProviderCard.tsx` | Liens `helpUrl` vers providers externes (Google, OpenAI, Anthropic) — inoffensifs comme liens UI | Documenter que ces URL sont des `<a href>` passifs uniquement (aucun appel réseau) | ESLint + no-fetch gate | Très faible | `git restore -- src/features/governance-center/` | PROPOSED |
| FIX-011 | P2 | Docs | `docs/MAP_*.md` | Cartographie MAP peut être désynchronisée après corrections FIX-001 à FIX-004 | Régénérer `bash scripts/map_refresh.sh` (ou créer script si absent) | `reports/MAP_PROOFS.log` mis à jour | Faible | `git restore -- docs/MAP_*.md` | PROPOSED |
| FIX-012 | P2 | Docs | `docs/MAP_MERMAID_OVERVIEW.md` | Vérifier les 4 diagrammes Mermaid obligatoires | `pnpm verify:docs:mermaid` (quand node_modules disponible) | `pnpm verify:docs:mermaid` PASS | Faible | `git restore -- docs/MAP_MERMAID_OVERVIEW.md` | PROPOSED |

---

## Lane-PROOF (QUALIFIED/STABLE) — Types/Engines/Services/Tauri/CI/Gates

---

### P0 — Stop-the-line (si confirmés en runtime)

| ID | Priorité | Ring | Fichiers Ciblés | Problème (Preuve) | Correction Minimale | Preuve DONE | Risque | Rollback | Statut |
|----|----------|------|-----------------|------------------|---------------------|-------------|--------|----------|--------|
| FIX-001 | P1 | R3 | `src/services/selfHealing/selfHealingObserver.ts:429` | **Commande**: `grep -n "window.fetch" src/services/selfHealing/selfHealingObserver.ts` → ligne 429. Monkey-patch `window.fetch` pour monitoring. En runtime Tauri, le httpClient bloque le réseau frontend — mais ce patch intercepte TOUS les appels fetch y compris les mocks de test. Risque: masquer des erreurs réseau frontend qui devraient être bloquées | Remplacer le monkey-patch par un listener d'événements Tauri ou hook IPC. Si le monitoring est requis, utiliser `tauri::event` pour capturer les erreurs réseau côté Rust | `grep -n "window.fetch = " src/services/selfHealing/selfHealingObserver.ts` → 0 occurrences | Moyen (casse le monitoring réseau pendant la correction) | `git restore -- src/services/selfHealing/selfHealingObserver.ts` | PROPOSED |
| FIX-002 | P0 | R2 | `src-tauri/src/engines/unified_memory/summarizer.rs:298,315`, `src-tauri/src/engines/unified_memory/embeddings.rs:213,216` | **Commande**: `grep -n "use http_client\|HttpClient::new()" src-tauri/src/engines/unified_memory/{summarizer,embeddings}.rs` → lignes 298, 315, 213, 216. Ring 2 (engines) fait de l'I/O réseau directement — violation invariant 4-Ring | Extraire les appels HTTP vers Ring 3 (services). Créer `src-tauri/src/services/embedding_service.rs` qui délègue via le gateway `overdrive/chat_orchestrator.rs`. Ring 2 reste pur | `pnpm test:architecture` PASS + `cargo check` sans warning I/O Ring 2 | Élevé (refactoring Rust, peut casser embedding pipeline) | `git restore -- src-tauri/src/engines/unified_memory/summarizer.rs src-tauri/src/engines/unified_memory/embeddings.rs` | PROPOSED |
| FIX-003 | P1 | R4 | `src/os/bridge/TauriBridge.ts:32,162,172`, `src/os/bridge/StateBridge.ts:84,116,225` | **Commande**: `grep -n "this.invoke\|this.bridge.invoke" src/os/bridge/TauriBridge.ts src/os/bridge/StateBridge.ts` → multiples occurrences. Appels `invoke()` directs hors du canonical client `tauriClient.ts` | Refactoriser `TauriBridge.ts` et `StateBridge.ts` pour utiliser `tauriClient` comme proxy. Ou documenter `TauriBridge` comme "implémentation de bas niveau autorisée" dans un gate explicite | `grep -n "this.invoke" src/os/bridge/` → 0 occurrences (ou gate d'exception documentée) | Moyen (bridges sont critiques pour l'OS layer) | `git restore -- src/os/bridge/TauriBridge.ts src/os/bridge/StateBridge.ts` | PROPOSED |
| FIX-004 | P1 | R3 | `src/utils/invoke.ts` | **Commande**: `cat src/utils/invoke.ts` → wrapper avec retry/timeout parallèle à `tauriClient.ts`. Crée une surface IPC non gouvernée | Déprécier `utils/invoke.ts` et migrer tous ses usages vers `src/lib/tauriClient.ts` ou `src/lib/security.ts`. Ajouter commentaire `@deprecated` | `grep -rn "from.*utils/invoke\|utils/invoke" src/` → 0 usages (hors tauriClient) | Faible (si utils/invoke peu utilisé) | `git restore -- src/utils/invoke.ts` | PROPOSED |

---

### P1 — Qualité et Fiabilité

| ID | Priorité | Ring | Fichiers Ciblés | Problème | Correction Minimale | Preuve DONE | Risque | Rollback | Statut |
|----|----------|------|-----------------|---------|---------------------|-------------|--------|----------|--------|
| FIX-005 | P1 | CI | Environnement runner | **Preuve**: `01_BOOTSTRAP.md` → pnpm not found, node_modules absent. Tous les tests/lint/build sont BLOCKED | Ajouter à `ci-unified.yml` un job local-check qui installe pnpm + deps avant les gates. Documenter dans README les prérequis locaux | `pnpm test` PASS dans CI | Faible | N/A (CI config seulement) | PROPOSED |
| FIX-006 | P1 | CI | `src-tauri/Cargo.toml` | **Preuve**: `cargo check` BLOCKED — GTK/glib-2.0 absent dans runner. Cargo.toml déclare `reqwest = "0.11"` (ancienne version, potentiel CVE) | 1) Documenter les prérequis GTK dans CI (déjà présents dans `ci-unified.yml` job lint). 2) Vérifier si reqwest 0.11 a des CVE via `cargo audit` | `cargo audit` → 0 HIGH/CRITICAL | Moyen (reqwest bump peut casser API) | `git restore -- src-tauri/Cargo.toml` | PROPOSED |
| FIX-009 | P2 | CI | `.github/workflows/` | 40+ workflows dont beaucoup semblent décoratifs (`cosmic-consciousness-synchronization.yml`, `multiversal-orchestrator.yml`, `infinite-dimensional-transcendence.yml`, etc.) | Audit et archiver dans `.github/workflows/archive/` les workflows non fonctionnels. Garder uniquement: ci-unified.yml, codeql.yml, release-unified.yml, dependabot.yml, gitguardian.yml, gates essentiels | Réduction à <15 workflows actifs + CI PASS | Faible (les workflows inutilisés ne nuisent pas) | `git restore -- .github/workflows/` | PROPOSED |

---

### P2 — Améliorations

| ID | Priorité | Ring | Fichiers Ciblés | Problème | Correction Minimale | Preuve DONE | Risque | Rollback | Statut |
|----|----------|------|-----------------|---------|---------------------|-------------|--------|----------|--------|
| FIX-010 | P2 | R4 Rust | `src-tauri/Cargo.toml` | `reqwest = { version = "0.11" }` — version ancienne (2023), reqwest 0.12 disponible avec améliorations sécurité | Vérifier CVE: `cargo audit`. Si pas de CVE critique, planifier bump vers 0.12 dans prochain cycle de maintenance | `cargo audit` → 0 HIGH + CI PASS | Moyen (changements API reqwest 0.11→0.12) | `git restore -- src-tauri/Cargo.toml` | PROPOSED |
| FIX-013 | P2 | CI | `.gitignore` | Fichiers de log et artefacts de développement à la racine (`build_log.txt`, `dev_tauri_log.txt`, `final_test_log.txt`, etc.) commités dans le repo | Ajouter patterns dans `.gitignore`: `*_log.txt`, `*.sh.new`, `titane-infinity@*` | `git status` → 0 fichiers log non traqués | Très faible | `git restore -- .gitignore` | PROPOSED |
| FIX-014 | P2 | Docs | `deployment/` | 272MB d'artifacts dans le repo (via LFS). deployment/v27.0.0-PRODUCTION (22MB), deployment/latest (240MB) | Vérifier si ces artifacts sont nécessaires dans le repo ou peuvent être gérés via GitHub Releases + CDN | Inventory LFS usage → plan cleanup | Faible | N/A (audit seul) | PROPOSED |

---

## Plan d'Exécution Ordonné

### Phase 1 — Déblocage Environnement (FIX-005, FIX-006)
```
FIX-005: pnpm install + node_modules → débloque tous les tests/lint
FIX-006: GTK system deps → débloque cargo check
Durée estimée: 30 minutes
```

### Phase 2 — Corrections P0/P1 Critiques (FIX-002, FIX-003, FIX-004)
```
FIX-002: Extraire HTTP Ring 2 → Ring 3 (Rust)  [1-2h]
FIX-003: Unifier invokes bridges via tauriClient  [30min]
FIX-004: Déprécier utils/invoke.ts  [15min]
FIX-001: Supprimer monkey-patch fetch (selfHealingObserver)  [30min]
Durée estimée: 3-4 heures
```

### Phase 3 — Nettoyage CI (FIX-009, FIX-013)
```
FIX-009: Archiver workflows décoratifs  [30min]
FIX-013: Nettoyer .gitignore  [15min]
Durée estimée: 45 minutes
```

### Phase 4 — Maintenance (FIX-010, FIX-014)
```
FIX-010: Évaluer reqwest bump  [1h audit + 2h si bump]
FIX-014: Plan cleanup LFS  [1h audit]
Durée estimée: 2-3 heures
```

### Phase 5 — Documentation (FIX-011, FIX-012, FIX-007, FIX-008)
```
FIX-011, FIX-012: Update docs MAP  [30min]
FIX-007, FIX-008: Documenter exceptions UI URLs  [15min]
Durée estimée: 45 minutes
```

---

## Gates Requises avant "QUALIFIED"

| Gate | Commande | Artefact |
|------|----------|---------|
| Tests PASS x3 | `pnpm test` (x3) | `05_TESTS_X3.log` |
| Architecture PASS | `pnpm test:architecture` | Log test |
| Lint PASS | `pnpm lint` | ESLint report |
| Format PASS | `pnpm format:check` | Prettier report |
| TypeScript PASS | `pnpm check` | TSC report |
| Cargo check PASS | `cargo check --all-targets` | Cargo output |
| IPC Contract PASS | `pnpm run guard:ipc-contract` | Contract test log |
| Tauri-Only PASS | `pnpm run verify:tauri-only` | Script output |
| Online-First PASS | `pnpm run verify:online-first` | Script output |
| Network Guard PASS | `pnpm run verify:network-guard` | Script output |
| No Ring 2 I/O | `grep -rn "http_client\|HttpClient::new()" src-tauri/src/engines/` → 0 | Grep output |
| No direct invoke | `grep -rn "this\.invoke\|invoke(" src/os/bridge/` → 0 | Grep output |
| AutoHeal captured | Entrée dans `autoheal_rules.jsonl` pour chaque fix | JSONL diff |

---

## Résumé Priorités

| Priorité | Nombre | Description |
|----------|--------|-------------|
| P0 (Stop-The-Line) | 1 | FIX-002 (I/O Ring 2 Rust) |
| P1 (Critique) | 4 | FIX-001, FIX-003, FIX-004, FIX-005, FIX-006 |
| P2 (Amélioration) | 5 | FIX-007 à FIX-014 |
| **Total** | **10** | |
