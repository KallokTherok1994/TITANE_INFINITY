# PATCH_PLAN — TITANE∞ vΩ.2

## Checklist (minimale & sûre)

### 1) Budgets globaux + timeouts
- **Fichiers**: src/config/aiTimeouts.config.ts, src/constants/timeouts.ts, src/__tests__/cloud-agent-timeout-config.test.ts
- **Ring**: Core/Engines (R2) + UI/Services (R3/R4)
- **Surface**: timeouts UI/stream/providers
- **Risque**: moyen (changements globaux)
- **Tests requis**: vitest (cloud-agent-timeout-config), smoke chat
- **Rollback**: revert des fichiers ci-dessus
- **Statut**: EXPERIMENTAL (tests non exécutés)

### 2) request_id end-to-end + summary logs
- **Fichiers**: src/services/ai/orchestrator.ts, src/services/api/chat.ts, src/services/tauri/chatEngine.commands.ts, src/services/tauriBridge.ts, src/services/conversationEngine.ts, src/services/ai/providers/tauriChat.ts, src/services/ai/ConversationManager.ts, src/utils/tauriProtector.ts, src/utils/ollamaFallback.ts, src-tauri/src/conversation_engine/commands.rs
- **Ring**: Services (R3) + Backend/UI (R4)
- **Surface**: IPC conversation_generate + logs
- **Risque**: moyen (contrat Tauri)
- **Tests requis**: rust tests ciblés conversation_engine + vitest
- **Rollback**: revert des fichiers listés
- **Statut**: EXPERIMENTAL

### 3) system_prompt obligatoire
- **Fichiers**: src/services/api/chat.ts, src/services/tauriBridge.ts, src/services/conversationEngine.ts, src/services/ai/providers/tauriChat.ts, src/services/ai/ConversationManager.ts, src/services/tauri/chatEngine.commands.ts
- **Ring**: Services (R3)
- **Surface**: IPC payload
- **Risque**: faible
- **Tests requis**: vitest conversationEngine
- **Rollback**: revert des fichiers listés
- **Statut**: EXPERIMENTAL

### 4) Cache TTL + singleflight + backoff (status)
- **Fichiers**: src/services/ai/statusCache.ts, src/services/ai/providers/copilot.ts, src/features/governance-center/services/governanceService.ts, src/services/ai/providers/tauriChat.ts
- **Ring**: Services (R3)
- **Surface**: get_copilot_key_status + chat_get_providers_status
- **Risque**: faible
- **Tests requis**: vitest ciblés (à ajouter si nécessaires)
- **Rollback**: revert fichiers listés
- **Statut**: EXPERIMENTAL

### 5) Throttle UI en `request_in_flight`
- **Fichiers**: src/hooks/useChat.ts, src/hooks/useSystemMonitor.ts, src/stores/useRequestInFlightStore.ts
- **Ring**: UI (R4)
- **Surface**: polling vitals/engines/readiness
- **Risque**: faible
- **Tests requis**: smoke UI + vitest hooks si existants
- **Rollback**: revert fichiers listés
- **Statut**: EXPERIMENTAL

### 6) provider unknown supprimé
- **Fichiers**: src/services/conversationEngine.ts, src/services/conversationEngine.test.ts, src/hooks/useAudioSettings.ts
- **Ring**: Services/UI (R3/R4)
- **Surface**: metadata provider
- **Risque**: faible
- **Tests requis**: vitest conversationEngine
- **Rollback**: revert fichiers listés
- **Statut**: EXPERIMENTAL
