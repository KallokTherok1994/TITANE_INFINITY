# 04 — Critical Chain Map

## Chain Entry Point
User sends message → `useChat.ts` → `sendMessage()`

## Chain Nodes

### 1. User Input
**Status**: CERTIFIED
**Role**: Entry point

### 2. useChat.ts → sendMessage()
**Status**: CERTIFIED
**Role**: Sends message to backend via `chatService.sendMessageLegacy()`

### 3. conversationEngine.ts → processMessage()
**Status**: CERTIFIED
**Role**: Memory decision, fallback detection, IPC call

### 4. Backend commands.rs → conversation_generate()
**Status**: CERTIFIED
**Role**: Memory recall, provider selection, fallback handling

### 5. Backend → Memory Recall
**Status**: CERTIFIED
**Role**: `router_decision.wants_memory` gates recall, `unified_memory.recall()` retrieves items

### 6. Backend → Provider Selection
**Status**: CERTIFIED
**Role**: `policy_verdict.allow_external_ai` determines provider, fallback chain

### 7. Backend → Response with Meta
**Status**: CERTIFIED
**Role**: Returns `meta` with `provider_used`, `reason_code`, `mode`, `memoryRecallIds`

### 8. Frontend → UI Display
**Status**: CERTIFIED
**Role**: `useChat.ts` extracts `actualProviderUsed`, `MessageBubble.tsx` shows badge

## Chain Status Summary
All 8 nodes: **CERTIFIED** ✅

## Memory Truth Verification
- Memory recall correctly gated by `router_decision.wants_memory`
- Memory injection correctly tracked in `memory_recall_ids`
- Memory status correctly propagated via `persistentMemoryStatus`
- Memory consumption tracked via `memory_sources_injected`

## Fallback Truth Verification
- Fallback correctly detected via `isTauriProtectorFallback`
- Fallback correctly handled via orchestrator
- Provider correctly tracked via `provider_used` in meta
- Degraded mode correctly tracked via `mode` in meta