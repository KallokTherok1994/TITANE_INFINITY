# 02 — SCOPE FREEZE
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Périmètre inclus

| Dossier/Fichier | Raison |
|-----------------|--------|
| `src/` | Vérité frontend — composants, services, hooks, types |
| `src-tauri/src/` | Vérité backend — commandes Rust, capabilities |
| `src-tauri/capabilities/` | Surfaces réseau et allowlists |
| `scripts/autoheal/` | AutoHeal registry |
| `proof_packs/` | Consolidation des preuves existantes |
| `tests/` | Garde-fous existants |

## Périmètre exclu

| Dossier/Fichier | Raison |
|-----------------|--------|
| `deployment/` | Artefacts de build — hors scope |
| `node_modules/` | Dépendances installées |
| `src-tauri/target/` | Build artifacts |
| `e2e/` | Tests E2E runtime non disponibles sans binaire Tauri |

## Budget de changement

| Type | Limite | Raison |
|------|--------|--------|
| Fichiers backend modifiés | ≤2 | Patch minimal |
| Fichiers capability modifiés | ≤1 | Retrait alias stale |
| Fichiers AutoHeal | 1 ligne append | Obligatoire |
| Fichiers proof pack | 19 requis | Ce pack |

## Impact rings attendu

- **Ring 3** (Services) : allowlist cleanup — impact minimal
- **Ring 4** (OS/UI) : aucun changement UI

## Engagement no-refactor

Aucun refactoring cosmétique. Chaque changement a une justification causale tracée.

## Politique de rollback

```bash
git restore -- src-tauri/capabilities/chat_ai.json
git restore -- scripts/autoheal/autoheal_rules.jsonl
```
