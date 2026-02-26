# 02_SCOPE_FREEZE.md

Date (UTC): 2026-02-26

## Portée autorisée (Pack 5 uniquement)
- Backend conversation/gateway/services:
	- `src-tauri/src/conversation_engine/commands.rs`
	- `src-tauri/src/services/search_gateway.rs`
- UI debug (validation wiring uniquement, sans redesign):
	- `src/components/debug/ChatDebugPanel.tsx`
	- `src/components/debug/TracePanel.tsx`
- Pack de preuve:
	- `docs/_evidence/pack5_capacites_20260226_135006/*`
	- `reports/pack5_*`

## Surfaces interdites
- Ajout de serveur HTTP interne/localhost.
- Appels réseau frontend directs (`fetch/axios/websocket`) hors Tauri canonique.
- Bypass robots/captcha/scraping.
- Secrets côté frontend ou logs.

## Feature flags Pack 5 (cibles)
- `CONVOS_SEARCH=1`
- `CONVOS_SOURCES_STORE=1`
- `CONVOS_MEMORY_SNAPSHOTS=1`
- `CONVOS_DEBUG_PANEL=1`
- `CONVOS_MEMORY_LTM=0` (OFF par défaut)

## Implémentation de default dans le code
- `src-tauri/src/conversation_engine/commands.rs`
	- Lecture env booléenne via `read_bool_env(...)` avec defaults gouvernés.

## Limites de dérive
- >10 fichiers touchés par sous-tâche: interdit.
- >2 rings touchés non planifiés: interdit.
- Nouvelle dépendance: interdite sans justification + rollback.
