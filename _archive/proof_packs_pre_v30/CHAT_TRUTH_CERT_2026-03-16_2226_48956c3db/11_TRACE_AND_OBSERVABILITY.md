# 11 — TRACE AND OBSERVABILITY

## TRACE_TRUTH_MATRIX

| Type de trace | Existe? | Source | Utilisable en runtime? | Support verdict? | Statut |
|--------------|---------|--------|----------------------|-----------------|--------|
| Send attempt | OUI | chatService.ts console.log + monitoring.addBreadcrumb() | OUI | OUI | PASS |
| Provider selection | OUI | commands.rs log::info! "[Ω:CMD] 📨 Request | req_id=..." | OUI (log::info) | OUI | PASS |
| Policy gate (allow_external_ai) | OUI | commands.rs log::warn! "[Ω:CMD] ⚠️ Policy gate: external AI blocked..." | OUI | OUI | PASS |
| Timeout | PARTIAL | invokeWithRetry timeout + LONG_COMMAND_OPTIONS | Frontend seulement | PARTIAL | PARTIAL |
| Retry | OUI | serviceInvoker.ts retries=3, backoffFactor=2 + log | OUI | OUI | PASS |
| Fallback provider | OUI | commands.rs FORCE_LOCAL_PROVIDER env log::warn | OUI | OUI | PASS |
| Memory read (LTM) | OUI | commands.rs log::info "[Ω:CMD] ✅ LTM context: X msgs loaded" | OUI | OUI | PASS |
| Memory read (MTM localStorage) | PARTIAL | chatMemoryCompactor.ts logger.debug | OUI (debug level) | PARTIAL | PARTIAL |
| Memory write | OUI | persist_conversation_os_artifacts() → log::info | OUI | OUI | PASS |
| routeContext injection | OUI | chatMemorySingleDoor.ts tags array + useLTMContext console | PARTIAL (pas de log dédié) | PARTIAL | PARTIAL |
| moduleContext injection | OUI | useConversationEngine.ts contextBinding dans metadata | OUI (message metadata) | OUI | PASS |
| TWINS enrichment | NON | Aucun | — | — | FAIL |
| TIME enrichment | NON | Aucun | — | — | FAIL |
| Command invoke | OUI | serviceInvoker.ts + commands.rs log::info | OUI | OUI | PASS |
| Command deny | PARTIAL | Capability deny=[]] — pas de log deny explicite côté Tauri | PARTIAL | PARTIAL | PARTIAL |
| Auto-heal trigger | OUI | useConversationEngine.ts: "Auto-réparation en cours" console.warn | OUI | PARTIAL | PARTIAL |
| Final response assembly | OUI | commands.rs log::info "[Ω:CMD] ✅ Success | req_id=... latency=...ms" | OUI | OUI | PASS |
| E2E mock activation | OUI | chat.ts isE2EChatMockEnabled() + rememberE2EConversationId | OUI | OUI | PASS |

## Gaps identifiés

1. **TWINS / TIME enrichment** : aucune trace — déconnexion confirmée.
2. **Command deny** : les capabilities Tauri v2 gèrent les deny au niveau kernel, pas de log applicatif observable.
3. **routeContext injection** : les tags single door sont créés (code présent) mais pas loggés de façon explicite sur le chemin critique.

## Verdict observabilité globale

- Chemin send/receive : **PASS**
- Mémoire LTM : **PASS**
- TWINS/TIME : **FAIL** (traces absentes = connexion absente confirmée)
- Provider fallback : **PASS**
- Auto-heal : **PARTIAL** (log présent, causalité non prouvée à runtime)
