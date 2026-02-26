# 11_ROLLBACK.md

## 1) Feature flags (gouvernance)
- `CONVOS_V1=0` pour couper le flux v1.
- `CONVOS_SEARCH=0` pour couper la recherche online.
- `CONVOS_MEMORY_LTM=0` par défaut (safe).
- `CONVOS_DEBUG_PANEL=0` pour masquer le panneau trace.

## 2) Désactivation rapide
- Basculer en mode local-only:
  - `OFFLINE_SIM=1`
  - `TITANE_OFFLINE_MODE=1`
  - `FORCE_LOCAL_PROVIDER=1`

## 3) Rollback git non destructif
- Restaurer fichiers ciblés:
  - `git restore -- src-tauri/src/conversation_engine/commands.rs`
  - `git restore -- src-tauri/src/engines src-tauri/src/services src/types src/components/debug registry/ui-events.jsonl`
- Revert commits Conversation OS si nécessaire:
  - `git revert e8e233d6`
  - `git revert 7bd00eff`

## 4) Données DB / migrations
- Schéma créé en mode `CREATE TABLE IF NOT EXISTS` (idempotent).
- En rollback applicatif, conserver les tables existantes en lecture seule; ne pas supprimer de données runtime sans procédure dédiée.

## 5) Allowlist rollback
- Retirer l’hôte de la configuration allowlist backend puis redéployer.
- Vérifier blocage via test allowlist (G2).

## 6) Safe mode attendu
- Réponse locale uniquement.
- Recherche externe désactivée.
- Snapshots/events toujours persistés en append-only.
