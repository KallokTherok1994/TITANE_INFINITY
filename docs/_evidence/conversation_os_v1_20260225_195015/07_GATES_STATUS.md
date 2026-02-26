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
