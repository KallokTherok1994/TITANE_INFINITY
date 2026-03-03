# 02_INVENTAIRE

## Sources inventoriées

- Bootstrap courant: `01_BOOTSTRAP.md`
- Packs antérieurs consultés (bootstrap): `ORCH_VΩ_*`, `ORCH_PERFECTION_*`, `FULL_AUDIT_CHAT_POWER_*`
- Scans invariants: `fetch/axios/ws/http`, `invoke/tauri`, `chat config`, `utf8 chunking`, `router/pipeline`

## Tâches ouvertes détectées (auto-déduction)

| ID | Tâche | État initial | Action | État final |
|---|---|---|---|---|
| T1 | Contradiction build-safe vs build réel | contradictoire | Règle explicite token→build réel x3, preuve `09_BUILD_X3.log` | terminé |
| T2 | BLOCKED flush coalescing (injectabilité) | incomplet | Correctif déjà présent confirmé + robustesse append_entry renforcée | terminé |
| T3 | Récence mémoire (`enforce_retention`) | flou | Test existant confirmé dans `chat_engine/memory.rs` | terminé |
| T4 | Streaming UTF-8 safe | flou | Char-safe + tests emoji déjà présents (`chat_engine/streaming.rs`) | terminé |
| T5 | Config unifiée UI↔backend | incomplet partiel | Vérification get/set IPC canonique (`ConfigurationHub.tsx`, `config/update.rs`) | terminé |
| T6 | Flow orchestrateur documenté | manquant | Ajout de `04_SCOPE_FLOW.md` avec pointeurs réels | terminé |
| T7 | Doctests cargo test bloquants | incomplet | correction doctests `search/router/policy` | terminé |

## Éléments non bloquants consignés

- `src/entry.ts` contient un `fetch('./main-entry.json')` local (asset bundle), non exposé vers endpoint externe.

