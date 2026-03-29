# 03 — Trace/Meta Chain Map

## Chain Entry Point
User sends message → `useChat.ts` → `sendMessage()`

## Chain Nodes

### 1. User Input
**Status**: CERTIFIED
**Role**: Entry point

### 2. useChat.ts → sendMessage()
**Status**: CERTIFIED
**Role**: Sends message to backend via `chatService.sendMessageLegacy()`

### 3. Backend commands.rs → conversation_generate()
**Status**: CERTIFIED
**Role**: Processes message through pipeline, generates response with meta

### 4. Backend → ProviderDecisionMeta
**Status**: CERTIFIED
**Role**: Produces canonical meta with:
- `provider_used`: actual provider used
- `provider_class`: local/remote/hybrid
- `mode`: LOCAL/REMOTE/OFFLINE/CACHED/ERROR
- `reason_code`: OK/POLICY_BLOCKED/FALLBACK_OFFLINE/etc.
- `network_used`: boolean

### 5. conversationEngine.ts → processMessage()
**Status**: CERTIFIED
**Role**: Receives raw response, normalizes metadata
- Extracts `raw.meta` → `providerMeta`
- Extracts `raw.provider` → `normalizedMetadata.provider_used`
- Returns `ConversationResponse` with `meta` and `metadata`

### 6. useChat.ts → metadataPatch
**Status**: CERTIFIED
**Role**: Maps backend truth to UI format
- Extracts `backendMeta.provider_used` → `actualProviderUsed`
- Creates `metadataPatch.providerUsed` (camelCase)
- Creates `metadataPatch.requestedProvider` (user preference)

### 7. MessageBubble.tsx → Badge Display
**Status**: CERTIFIED
**Role**: Displays provider badge
- Shows `metadata.providerUsed` in badge
- Detects mismatch with `metadata.requestedProvider`
- Adds CSS class `message-provider-badge-mismatch` if mismatch
- Shows ⚠ indicator if mismatch detected

## Chain Status Summary
All 7 nodes: **CERTIFIED** ✅

## Propagation Verification
- Backend → Frontend: `provider_used` (snake_case) correctly mapped to `providerUsed` (camelCase)
- Fallback detection: `reason_code` correctly propagated
- Mismatch detection: `requestedProvider` vs `providerUsed` comparison works