# 00_EXEC_SUMMARY — PROVIDER TRUTH LOCK #1

**Date:** 2026-03-20  
**Mode:** BACKGROUND — VERIFY → REPAIR → CERTIFY  
**Scope Ring:** R3 (api/chat.ts) + R4 (hooks/useChat.ts, MessageBubble.tsx)  
**Risk:** P1  
**Pre-repair HEAD:** 0000bdeee  
**Post-repair HEAD:** (see VERDICT)

## Findings

### LOCK1 original patch (0dd11f69e): INCOMPLETE
- `useChat.ts` correctly added `providerUsed` to `metadataPatch`
- `ChatWindow.tsx` correctly passed `metadata` to `MessageBubble`
- `MessageBubble.tsx` correctly renders provider badge
- **GAP FOUND:** `sendMessage` in `chat.ts` read `backendResponse.metadata?.provider`
  which is ALWAYS `undefined` in the `conversation_generate` OMEGA format
- Real truth was in `backendResponse.meta.provider_used` (ProviderDecisionMeta)
- Result: badge would show `'tauri-backend'` always — chain broken at R3 boundary

### LOCK1-REPAIR (this session)
- `chat.ts` `sendMessage`: read `backendResponse.meta.provider_used` as canonical source
- Set `ChatResponse.provider` = `actualProvider` (truth, not 'tauri-backend')
- Set `ChatResponse.metadata.provider_used` = same (for LOCK1 fix in useChat.ts)
- Set `ChatResponse.metadata.provider_meta` = full `backendResponse.meta` object

## Status: PASS (PROVEN_RUNTIME)
