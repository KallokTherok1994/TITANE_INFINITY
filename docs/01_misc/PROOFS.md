# PROOFS — TITANE∞ vΩ.2

## Preuves (statique / code)
- **Budgets globaux**: `REQUEST_BUDGETS` introduit (global=25s, provider=8s, maxAttempts=3) et utilisé dans l’orchestrateur.
- **Summary line**: log `[AI_SUMMARY]` ajouté en fin de requête dans l’orchestrateur (succès + erreurs).
- **`request_id` end-to-end**: payload `request_id` propagé (useChat → chatService → conversation_generate → backend). Backend log `req_id` + metadata.
- **`system_prompt` non-null**: fallback `getSystemPrompt('default')` injecté sur tous les wrappers (tauriBridge, chatService, chatEngine.commands, ConversationManager, conversationEngine, tauriChat).
- **Cache status**: `StatusCache` (TTL + singleflight + backoff) appliqué pour Copilot + governance + providers status.
- **Ollama fallback**: AbortController 1.5s pour éviter attente longue.
- **request_in_flight**: store global + throttling polling system monitor + readiness polling suspendu.

## Preuves (runtime)
- **Non exécuté**: aucune exécution locale/CLI durant ce patch.
