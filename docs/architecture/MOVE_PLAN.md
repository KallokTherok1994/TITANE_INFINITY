# MOVE_PLAN
**TITANE∞ — Plan de moves: sûrs vs différés**
**Date**: 2026-03-26
**Phase**: PHASE 6 — CORE / LABS / OPS

---

## Règle de promotion des moves

```
Move physique autorisé seulement si:
1. Tests PASS (pnpm test + pnpm run test:architecture)
2. Build TypeCheck PASS (pnpm run check)
3. Pas d'import cassé (grep exhaustif)
4. Rollback `git revert` immédiatement disponible
```

---

## MOVES SÛRS IMMÉDIATS (conventions sans déplacement physique)

Ces actions modifient uniquement la documentation/marquage, sans toucher les imports.

| Action | Fichier(s) | Risque | Statut |
|--------|-----------|--------|--------|
| Corriger header App.tsx `v26.3.0` → `v28.88.0` | `src/App.tsx` lignes 2,11 | P2 | ✅ FAIT (Phase 1) |
| Créer AUTHORITY_BASELINE.md | `docs/architecture/` | P2 | ✅ FAIT (Phase 1) |
| Créer CENTERS_AUDIT.md | `docs/architecture/` | P2 | ✅ FAIT (Phase 2) |
| Extraire useAppInitialization | `src/hooks/useAppInitialization.ts` | P1 | ✅ FAIT (Phase 3) |
| Alléger App.tsx (dead code + inits) | `src/App.tsx` | P1 | ✅ FAIT (Phase 3) |
| Créer DEPENDENCY_DECISION_MATRIX.md | `docs/architecture/` | P2 | ✅ FAIT (Phase 4) |
| Créer MEMORY_AUTHORITY_MAP.md | `docs/architecture/` | P2 | ✅ FAIT (Phase 5) |
| Créer TARGET_REPO_SHAPE.md | `docs/architecture/` | P2 | ✅ FAIT (Phase 6) |
| Ajouter commentaire legacy dans UnifiedMemoryService.ts | `src/services/memory/UnifiedMemoryService.ts` | P2 | PENDING |
| Ajouter LABS.md dans features/vision/ | `src/features/vision/LABS.md` | P2 | PENDING |
| Ajouter LABS.md dans modules/avatar/ | `src/modules/avatar/LABS.md` | P2 | PENDING |

---

## MOVES PHYSIQUES — DIFFÉRÉS (nécessitent baseline complète)

Ces actions déplacent des fichiers et cassent des imports. Attendent:
- Baseline `pnpm test` PASS à 100%
- Architecture tests PASS
- Session dédiée avec branch + safety commit

| Action | De | Vers | Blocage | Priorité |
|--------|----|----|---------|---------|
| Supprimer `src/_deprecated/` | — | — | Audit imports exhaustif requis | P2, session dédiée |
| Déplacer `features/vision/` → `src-labs/vision/` | `src/features/vision/` | `src-labs/vision/` | Imports à mettre à jour | P3, longue durée |
| Déplacer `modules/avatar/` → `src-labs/avatar/` | `src/modules/avatar/` | `src-labs/avatar/` | Imports 3D lourds | P3 |
| Isoler `services/memory/UnifiedMemoryService.ts` | — | `src-labs/memory-legacy/` | MemoryIntelligenceEngine à réviser | P2, après migration MIE |
| Migrer `MemoryIntelligenceEngine.ts` vers `UnifiedMemory.ts` canonical | — | — | Interfaces incompatibles (`MemoryEntry` vs `UnifiedMemoryEntry`) — 1082L / ~20 usages | P2, session dédiée |
| ~~Supprimer `recharts`~~ | — | — | **ANNULÉ** — 4 fichiers confirment usage réel (MetricsGraph.tsx lazy-load) | — |
| ~~Retirer `cpal` de default Cargo features~~ | — | — | **FAIT** (2026-03-26) — audio-capture opt-in, cargo check PASS | DONE |

---

## MOVES BLOQUÉS (doctrine ou risque P0)

| Action | Raison de blocage |
|--------|------------------|
| Supprimer `services/unified/` | P0 — Memory OS canonical |
| Supprimer `services/chat/chatMemorySingleDoor.ts` | P0 — porte unique mémoire chat |
| Modifier `services/ai/omegaModeClassifier.ts` | P0 — OMEGA pipeline |
| Supprimer `better-sqlite3` sans remplacement | P1 — SQLiteVectorStore dépend, risque Memory OS |
| Refactorer `conversationEngine.ts` | P0 — chaîne chat canonique |
| Move `src-tauri/src/unified_memory_v2/` | P0 — backend autoritaire |

---

## Rollback universel

```bash
# Par commit (recommandé)
git revert <sha_commit>

# Pour annuler les docs créés Phase 1-6:
git stash  # ou git checkout -- docs/architecture/
```

---

## Rappel discipline de branche

Avant tout move physique:
1. `git checkout -b feat/core-labs-ops-moves`
2. `git add -p` (staging sélectif)
3. Commit par intention unique
4. Tests PASS avant merge
