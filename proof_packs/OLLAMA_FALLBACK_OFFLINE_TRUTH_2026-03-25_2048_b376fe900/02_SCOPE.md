# PÉRIMÈTRE

## Inclus
- `src/utils/tauriProtector.ts` — Source du signal FALLBACK_OFFLINE
- `src/services/conversationEngine.ts` — Consommateur du signal, gestion du fallback
- `src/services/ai/orchestrator.ts` — Orchestrator avec fallback titane-local
- `src/services/ai/providers/ollama.ts` — Provider Ollama
- `src/services/ai/transports/ollamaTransport.ts` — Transport IPC Ollama

## Exclus
- Réécriture du provider system
- Modification du tauriProtector lui-même
- Changement de la politique de fallback
