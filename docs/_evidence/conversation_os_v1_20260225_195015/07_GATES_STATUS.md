# 07_GATES_STATUS.md

## Résumé
- Mode: stop-the-line strict
- Source principale des runs: `reports/conversation_os_unified_g1_g10_x3_campaign_v2.log`

| Gate | Statut | Preuve | Note |
|---|---|---|---|
| G1 FRONTEND_NO_WEB | FAIL | scan `src/**` dans `09_PROOF_LOGS.txt` | Présence d’appels `fetch/WebSocket` frontend dans surfaces legacy; invariant absolu non satisfait globalement |
| G2 GATEWAY_ALLOWLIST_ONLY | PASS x3 | `G2_RUN_1/2/3_EXIT:0` | test allowlist OK |
| G3 NO_SILENT_FALLBACK | PASS x3 | `G3_RUN_1/2/3_EXIT:0` | test anti-silence dédié OK |
| G4 NETSTATE_TRANSITIONS_VALID | PASS x3 | `G4_RUN_1/2/3_EXIT:0` | transition résilience validée |
| G5 RATE_LIMIT_AWARE | PASS x3 | `G5_RUN_1/2/3_EXIT:0` | rate limiter validé |
| G6 SOURCES_STORED_AND_CITABLE | PASS x3 | `G6_RUN_1/2/3_EXIT:0` | persistance sources validée |
| G7 DB_APPEND_ONLY_HASH | PASS x3 | `G7A_RUN_1/2/3_EXIT:0`, `G7B_RUN_1/2/3_EXIT:0` | append-only + SHA validés |
| G8 OFFLINE_STRICT | PASS x3 | `G8_RUN_1/2/3_EXIT:0` | offline policy test OK |
| G9 E2E_DESKTOP_3X | PASS x3 | `G9_RUN_1/2/3_EXIT:0` | suite Playwright critical x3 OK |

## Décision gate
- **BLOCKED** (G1 en FAIL strict)

## Écart de spécification notable
- `SearchGatewayService` applique un fallback DDG si `BRAVE_API_KEY` absente, au lieu d’un blocage explicite `CREDENTIALS_MISSING`.

## Addendum remédiation 2026-02-26

### Delta validé
- ✅ Écart SearchGateway corrigé via commit `78b8e5ae` (`src-tauri/src/services/search_gateway.rs`).
- ✅ Test dédié x3 PASS: `services::search_gateway::tests::test_search_requires_brave_api_key` avec `EXIT_1/2/3:0` dans `reports/conversation_os_g1_remediation_search_credentials_x3.log`.

### Lecture G1 (strict)
- G1 global (`src/**` sans distinction legacy): **reste FAIL** tant que des surfaces historiques `fetch/WebSocket` existent.
- G1 périmètre Conversation OS v1 (client canonique `conversation_generate`): **PASS (audit ciblé)**, aucune primitive réseau directe détectée dans:
	- `src/services/tauriBridge.ts`
	- `src/services/api/chat.ts`
	- `src/services/ai/providers/tauriChat.ts`
	- `src/services/tauri/chatEngine.commands.ts`
	- preuve: `reports/conversation_os_g1_scoped_surface_audit_20260226.log` (`DIRECT_NETWORK_EXIT:1` attendu = aucun match)

### Statut actuel
- Décision globale du pack: **BLOCKED** (G1 global strict)
- Décision du sous-scope Conversation OS v1: **QUALIFIED**

## Addendum Phase 1 (2026-02-26)

### Exécution
- Inventaire global `src/**` effectué via scan unique `fetch|axios|XMLHttpRequest|WebSocket`.
- Classification exhaustive ligne par ligne produite.

### Preuves
- `reports/conversation_os_g1_phase1_raw_20260226T010320Z.log`
- `reports/conversation_os_g1_phase1_summary_20260226T010320Z.md`
- `reports/conversation_os_g1_phase1_classification_20260226T010330Z.csv`
- Dossier pack: `13_G1_PHASE1_INVENTORY.md`

### Résultat phase 1
- Total matches: 85
- `IN_SCOPE_CONVOS_V1`: 0
- `TEST_ONLY`: 7
- `LEGACY_HORS_SCOPE`: 78

### Décision
- Phase 1 = **PASS** (inventaire + classification complets)
- Gate G1 global = **FAIL (inchangé)** en attente Phase 2
