# SCOPE

## Périmètre Audité

| Répertoire | Rôle | Inclus |
|---|---|---|
| `src/` | Frontend React/TypeScript | ✅ Oui |
| `src-tauri/src/` | Backend Rust + Tauri | ✅ Oui |
| `src-tauri/src/commands/` | IPC command handlers | ✅ Oui |
| `src-tauri/src/neural_memory/` | STM/MTM/LTM Rust | ✅ Oui |
| `src-tauri/src/unified_memory_v2/` | Unified Memory API | ✅ Oui |
| `src-tauri/src/conversation_engine/` | OMEGA Pipeline | ✅ Oui |
| `src-tauri/src/overdrive/` | Chat orchestrator hybride | ✅ Oui |
| `docs/` | Documentation canonique | ✅ Partiel (AI_PROVIDERS.md) |
| `scripts/autoheal/` | Règles AutoHeal | ✅ Oui |
| `e2e/` | Tests E2E WDIO | ✅ Oui |
| `proof_packs/` | Packs preuves passés | ✅ Référencés |

## Périmètre Hors-Scope

- `node_modules/` — dépendances tierces, non audité
- `dist/` — artefacts build, non audité en détail
- `deployment/` — manifestes déployés, non vérifiés en détail
- `titane_local_training/` — données training, non audité
- `legacy/` — code archivé, non audité

## Surface IPC Totale

- **~200+ commandes** enregistrées dans `generate_handler!` (main.rs L1293+)
- **40+ fichiers** de commandes dans `src-tauri/src/commands/`
- **8 stubs confirmés** (catalogués dans 08_COMMAND_TRUTH_MATRIX.md)

## Gel du Scope

Scope gelé au SHA `ce22c1f4f` (2026-03-16T20:32:55Z).  
Aucune modification de code dans cet audit (lecture seule).
