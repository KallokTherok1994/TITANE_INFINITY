# 02 — Canonical Truth Contract

## Provider Label Truth Contract

### Field: provider_used
- **Source of Truth**: Backend `ProviderDecisionMeta.provider_used`
- **Producer**: `commands.rs` → `conversation_generate()` → `ensure_provider_meta()`
- **Consumer**: `conversationEngine.ts` → `normalizedMetadata.provider_used`
- **Expected Payload**: String (e.g., "gemini", "ollama", "local", "fallback")
- **Confidence**: HIGH
- **Proven**: YES ✅

### Field: provider_class
- **Source of Truth**: Backend `ProviderDecisionMeta.provider_class`
- **Producer**: `commands.rs` → `provider_class_from_id()`
- **Consumer**: `conversationEngine.ts` → `providerMeta.provider_class`
- **Expected Payload**: "local" | "remote" | "hybrid"
- **Confidence**: HIGH
- **Proven**: YES ✅

### Field: mode
- **Source of Truth**: Backend `ProviderDecisionMeta.mode`
- **Producer**: `commands.rs` → `mode_from()`
- **Consumer**: `conversationEngine.ts` → `providerMeta.mode`
- **Expected Payload**: "LOCAL" | "REMOTE" | "OFFLINE" | "CACHED" | "ERROR"
- **Confidence**: HIGH
- **Proven**: YES ✅

### Field: reason_code
- **Source of Truth**: Backend `ProviderDecisionMeta.reason_code`
- **Producer**: `commands.rs` → `ReasonCode` enum
- **Consumer**: `conversationEngine.ts` → `providerMeta.reason_code`
- **Expected Payload**: ReasonCode enum value
- **Confidence**: HIGH
- **Proven**: YES ✅

### Field: network_used
- **Source of Truth**: Backend `ProviderDecisionMeta.network_used`
- **Producer**: `commands.rs` → derived from provider_class
- **Consumer**: `conversationEngine.ts` → `providerMeta.network_used`
- **Expected Payload**: boolean
- **Confidence**: HIGH
- **Proven**: YES ✅

### Field: fallback_used
- **Source of Truth**: Backend metadata or orchestrator
- **Producer**: `commands.rs` or `orchestrator.ts`
- **Consumer**: `conversationEngine.ts` → `omega_trace_meta.fallback_used`
- **Expected Payload**: boolean
- **Confidence**: MEDIUM
- **Proven**: YES ✅

### Field: providerUsed (UI)
- **Source of Truth**: `useChat.ts` → `actualProviderUsed`
- **Producer**: `useChat.ts` → extracted from `backendMeta.provider_used`
- **Consumer**: `MessageBubble.tsx` → badge display
- **Expected Payload**: String
- **Confidence**: HIGH
- **Proven**: YES ✅

### Field: requestedProvider (UI)
- **Source of Truth**: `useChat.ts` → `preferredProviderState`
- **Producer**: `useChat.ts` → from localStorage or default "auto"
- **Consumer**: `MessageBubble.tsx` → mismatch detection
- **Expected Payload**: String
- **Confidence**: HIGH
- **Proven**: YES ✅

## Invariants (Codés)
1. `mode === 'REMOTE'` → `network_used === true`
2. `provider_used === 'local_only'` → `mode !== 'REMOTE'`
3. Fallback → `reason_code !== 'OK'` and `reason_code !== 'UNKNOWN'`
4. `providerUsed` always defined (never undefined or null)