# 02_SCOPE_FREEZE.md

Date (UTC): 2026-02-26
Statut: **IMMUTABLE**

## Périmètre autorisé (minimal)
- Pack de preuve courant uniquement: `docs/_evidence/conversation_os_v1_20260226_122608/**`
- Logs de preuve: `reports/conversation_os_v1_next_run_*`
- Lecture/validation des surfaces runtime existantes:
	- `src-tauri/src/engines/conversation_os/**`
	- `src-tauri/src/services/network_gateway.rs`
	- `src-tauri/src/services/search_gateway.rs`
	- `src-tauri/src/services/db_service.rs`
	- `src-tauri/src/conversation_engine/commands.rs`

## Surfaces interdites
- Appels open-web frontend non gouvernés.
- Tout nouveau serveur HTTP/interne.
- Toute nouvelle surface réseau hors `NetworkGatewayService`.
- Tout fallback silencieux.
- Tout secret en frontend.

## Feature flags figées
- `CONVOS_V1=1`
- `CONVOS_NETWORK_GATEWAY=1`
- `CONVOS_RESILIENCE=1`
- `CONVOS_SEARCH=1`
- `CONVOS_MEMORY_SNAPSHOTS=1`
- `CONVOS_MEMORY_LTM=0` (OFF par défaut)
- `CONVOS_DEBUG_PANEL=1`

## Hard limits
- Toute micro-phase >10 fichiers touchés => **STOP/BLOCKED**.
- Toute micro-phase touchant >2 Rings de façon imprévue => **STOP/BLOCKED**.
- Toute nouvelle dépendance => **STOP** tant que justification + rollback non écrits.

