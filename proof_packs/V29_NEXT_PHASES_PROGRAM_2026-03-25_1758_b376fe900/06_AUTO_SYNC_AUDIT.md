# Audit phase C - Auto-Sync

## Etat trouve

- Surface active: `src/pages/CloudCenter/`
- Backend reel:
  - `cloud_sync_push`
  - `cloud_sync_pull`
  - historique de sync
  - status cloud
- Le mode `auto` etait expose dans UI et accepte par `cloud_update_config`.
- Aucune boucle runtime auto-sync n'a ete trouvee dans `src-tauri/src/cloud/cloud_sync_engine.rs`.

## Lock reel

`C-L1-AUTO-SYNC-FAKE`

- Cause: le produit laissait croire qu'un auto-sync existait alors qu'aucun scheduler runtime n'etait present.
- Impact: badge/etat potentiellement mensonger.

## Correctif minimal

- UI config:
  - option `auto` desactivee
  - note explicite de blocage
  - sauvegarde bloquee si config legacy `auto`
- UI status:
  - libelle `Automatique (config seule, non prouve)`
- Backend:
  - `cloud_update_config` refuse `auto`

## Statut phase C

- Verdict phase C: `PARTIAL`
- Sous-verdict sync: `AUTO_SYNC_MANUAL_ONLY`
