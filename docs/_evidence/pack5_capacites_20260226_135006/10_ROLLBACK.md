# 10_ROLLBACK.md

Date (UTC): 2026-02-26

## Rollback code (Pack 5)
- Restaurer le backend Pack5:
	- `git restore -- src-tauri/src/conversation_engine/commands.rs src-tauri/src/services/search_gateway.rs`

## Rollback docs preuve (Pack5)
- `git restore -- docs/_evidence/pack5_capacites_20260226_135006`

## Rollback logs de preuve
- Les logs `reports/pack5_*` sont des artefacts de preuve; suppression locale possible si nécessaire.

## Rollback fonctionnel via flags
- Désactiver recherche:
	- `CONVOS_SEARCH=0`
- Désactiver stockage sources:
	- `CONVOS_SOURCES_STORE=0`
- Désactiver snapshots:
	- `CONVOS_MEMORY_SNAPSHOTS=0`
- Masquer debug panel (si piloté frontend):
	- `CONVOS_DEBUG_PANEL=0`
- Forcer LTM vector OFF:
	- `CONVOS_MEMORY_LTM=0`
