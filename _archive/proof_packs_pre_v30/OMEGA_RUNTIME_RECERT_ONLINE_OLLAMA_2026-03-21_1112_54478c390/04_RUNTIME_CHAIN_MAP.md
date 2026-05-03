# Step 4: Runtime Chain Map (Static Analysis)

## Provider Chain (chat_orchestrator.rs)
```
fn is_ollama_auto_enabled() -> bool  [line 29]
async fn is_provider_available(...)  [line 328]
  const MAX_FAILURES: u32 = 3        [line 334]
  return *count < MAX_FAILURES       [line 346]
async fn increment_provider_failures  [line 402]
async fn reset_provider_failures     [line 416]
```
Circuit breaker: MAX_FAILURES=3, failure counter resets per-cycle.

## Timeout Config (src-tauri/src/ollama/)
```
const TIMEOUT_QUICK_SECS: u64 = 10    // <500 chars
const TIMEOUT_STANDARD_SECS: u64 = 30 // 500-2000 chars
const TIMEOUT_EXTENDED_SECS: u64 = 60 // >2000 chars / streaming
const TIMEOUT_LOCAL_SECS: u64 = 45    // Ollama/local (R02 adaptive)
```

## IPC Contract (conversation_engine/commands.rs)
- `conversation_generate` command: line 210
- `ConversationGenerateArgs` struct: line 27
- Payload: `{ ok, content, error }` canonical contract

## Frontend Recovery (useConversationEngine.ts)
```ts
const noProviderPayload =
  response.meta?.reason_code === 'FALLBACK_OFFLINE' ||
  response.meta?.reason_code === 'PROVIDER_UNAVAILABLE'; [line 336-337]
```
Recovery message trigger: present and correct.

## errorClassification.ts
```
/state not managed/i  [line 45]
/state not found/i    [line 46]
/type.*not.*managed/i [line 47]
```
Present — fix from prior session confirmed.

## Chain Assessment
IPC contract intact. Timeouts adaptive (10-60s). Circuit breaker at MAX_FAILURES=3. 
Frontend recovery paths: FALLBACK_OFFLINE + PROVIDER_UNAVAILABLE both handled.
