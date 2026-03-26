# CONSOLIDATED_AUTHORITY_STATE
**Date**: 2026-03-26 | **Version**: 28.88.0 | **Verdict**: STABLE

Carte unique de l'état consolidé après le chantier principal d'optimisation.
Ne pas rouvrir une autorité verrouillée sans contradiction prouvée.

---

## AUTORITÉS VERROUILLÉES (ne pas remettre en cause sans preuve)

| Autorité | Valeur canonique | Source | Preuve |
|----------|-----------------|--------|--------|
| Version canonique | `28.88.0` | `package.json` | AUTHORITY_BASELINE PASS |
| Source d'autorité version | `package.json` → `CHANGELOG.md` | — | PASS |
| Shell principal | `src/App.tsx` (947L) + `useAppInitialization` + `useTopNavigation` | — | tsc PASS + build PASS |
| Chaîne chat canonique | `conversationEngine.ts` → `tauriClient` IPC → Rust backend | — | vitest 7/7 PASS |
| Provider fallback | `championChallenger.ts` + `aiOrchestrator` cascade | `CHAT_POLICY_BASELINE` | QUALIFIED |
| Memory canonical path (front) | `services/unified/UnifiedMemory.ts` → `VectorStoreClient` → `SQLiteVectorStore` | `MEMORY_AUTHORITY_MAP` | QUALIFIED |
| Memory canonical (back) | `src-tauri/src/unified_memory_v2/` | — | cargo check PASS |
| Memory injection chat | `chatMemorySingleDoor.formatContextEnvelopeForSystemPrompt()` | — | QUALIFIED |
| Policy chat | `responsePolicy.ts` — 5 profils: DIRECT / BALANCED / DEEP / ARCHITECT / OMEGA | `CHAT_POLICY_BASELINE` | QUALIFIED |
| Rust default features | `["custom-protocol", "mock"]` (audio-capture opt-in) | `Cargo.toml` | cargo check PASS |
| Séparation Core/Labs/Ops | Convention LABS.md + commentaires (pas de moves physiques) | `TARGET_REPO_SHAPE` | QUALIFIED |

---

## DÉCISIONS QUALIFIED (tiennent jusqu'à preuve contraire)

| Décision | Doc de référence | Conditions de révision |
|----------|-----------------|----------------------|
| 37 surfaces classées KEEP_CORE/ALIAS/LABS/HIDE/DELETE | `CENTERS_AUDIT` | Contradiction runtime prouvée |
| recharts = KEEP_LAZY (4 fichiers, lazy-load) | `DEPENDENCY_MATRIX` | Si 0 usages prouvé par grep exhaustif |
| better-sqlite3 = KEEP_CORE (SQLiteVectorStore prod) | `DEPENDENCY_MATRIX` | Node.js vs Tauri compat test réel |
| three.js = LABS_ONLY (avatar, 4 fichiers) | `DEPENDENCY_MATRIX` | Preuve d'usage hors avatar |
| ort = LABS_ONLY (ONNX opt-in) | `RUST_FEATURES_DECISION` | Usage prod prouvé |
| vitest PASS ≠ desktop proof | `TEST_AUTHORITY_MAP` | Révision impossible (architecturale) |
| Moves physiques = DEFERRED P3 | `MOVE_PLAN` | Test baseline 100% + regression suite |

---

## CONTRADICTIONS RÉSIDUELLES EXPLICITES

| Contradiction | Nature | Statut | Action requise |
|---------------|--------|--------|----------------|
| `MemoryIntelligenceEngine.ts` importe `UnifiedMemoryService` (legacy) | Import legacy dans nouveau fichier | DEFERRED P2 | Migration après session dédiée (interfaces incompatibles) |
| `features/conversation/` (7f) vs `features/chat/` (11f) | Overlap potentiel | UNKNOWN | Audit Phase 3 de ce doc |
| `better-sqlite3` prod dep — risque compat Tauri WebView | Env incompatibilité potentielle | BLOCKED_ENV | Test runtime Tauri requis |
| DEEP/ARCHITECT/OMEGA profiles | Wired non prouvés E2E | WIRED_BUT_UNPROVEN | Desktop E2E (BLOCKED_ENV) |
| `chatClient.ts` — import count 0 dans src/ | Potentiellement orphelin | UNKNOWN | Vérification exhaustive Phase 3 |

---

## DIFFÉRÉ EXPLICITEMENT

| Item | Raison | Gate requise |
|------|--------|-------------|
| SEALED verdict | Desktop E2E BLOCKED_ENV | wdio+tauri-driver PASS |
| Physical Core/Labs/Ops moves | Test baseline 100% requis | vitest 100% + regression suite |
| MemoryIntelligenceEngine migration | Interface incompatible (P2) | Session dédiée |
| Ollama streaming SSE réel | Feature work P3 | Session dédiée |
| TimePage flowState wiring | Feature work P2 | Session dédiée |
| playwright baseline | Browser E2E — env requis | CI setup |

---

## ROLLBACK GLOBAL

```bash
# Commits consolidation (cette session)
git log --oneline -5
git revert <sha>  # par intention unitaire

# Commits chantier principal
git revert f570ec62a..HEAD  # annule session complète
```

---

## PROCHAINES ACTIONS AUTORISÉES SANS ROUVRIR LE NOYAU

1. Consolider docs d'autorité (cette phase)
2. Clarifier unknowns à coût bas (chatClient, conversation/chat overlap)
3. Installer garde-fous de développement
4. Préparer suite Claude Code
5. Hardening léger (suppressions prouvées, corrections doc)
