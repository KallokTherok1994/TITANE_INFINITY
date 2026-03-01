# AUDIT_REPORT — TITANE∞ vΩ.2

## Synthèse
- **Statut**: changements de robustesse/latence appliqués (local-first, Tauri-only, budgets <= 25s).
- **Portée**: Types/Engines/Services/UI + backend Tauri (contrat `conversation_generate`).

## Constats principaux
1) **`system_prompt` pouvait être `undefined`** (plusieurs points d’entrée) → état illégal.
2) **`provider` pouvait tomber à `unknown`** (metadata conversation + tests) → contrat non strict.
3) **Budgets excessifs** (UI 90s, providers 60–75s) → risque de latence extrême (308s).
4) **Absence de `request_id` end-to-end** → traçabilité faible, logs non corrélés.
5) **Invocations status redondantes** (`get_copilot_key_status`, `chat_get_providers_status`) → boucles et bruit.
6) **Fallback Ollama sans timeout** → blocage long si endpoint down.
7) **Cycles UI non throttlés pendant génération** → contention (polling vitals/engines/readiness).

## Causes racines
- Valeurs de timeouts historiques alignées sur cloud (v26.2.1) sans budget global.
- `system_prompt` optionnel sur plusieurs wrappers non normalisés.
- Status checks sans TTL/singleflight/backoff.
- Pipeline sans `request_id` contractuel.

## Risques
- Latence > budget et UX “silence” en cas d’attente longue.
- Logs non corrélés, difficile d’identifier la cause (router/provider/IPC).
- Fallback Ollama peut bloquer si service inactif.

## Correctifs appliqués (résumé)
- Budgets globaux/attempts centralisés (<= 25s, max 3 tentatives).
- `request_id` ajouté du front au backend + logs summary.
- `system_prompt` par défaut garanti.
- Cache TTL + singleflight + backoff pour status clés.
- Fallback Ollama borné (AbortController 1.5s).
- Throttle cycles UI pendant `request_in_flight`.

## Fichiers clés
- Timeouts: src/config/aiTimeouts.config.ts, src/constants/timeouts.ts
- Router/summary: src/services/ai/orchestrator.ts
- Contract req_id: src-tauri/src/conversation_engine/commands.rs + callers
- UI throttle: src/hooks/useChat.ts, src/hooks/useSystemMonitor.ts, src/stores/useRequestInFlightStore.ts
