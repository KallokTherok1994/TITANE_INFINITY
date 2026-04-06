# CHAT_PROVIDER_CHAIN_MAP

## Ollama (Primary Incident Path)

| Hop | File | Function | Input | Output | Owner | Truth Status | Stale Risk |
|-----|------|----------|-------|--------|-------|-------------|------------|
| 1. UI sends | src/pages/Chat*.tsx | sendMessage() | user text | chat request | UI | PASS | LOW |
| 2. Store/hook | src/hooks/useChat*.ts | send() | message | IPC invoke | Hook | PASS | LOW |
| 3. IPC command | src/services/tauri/chatEngine.commands.ts | generateResponse() | request | Tauri invoke | TS bridge | PASS | LOW |
| 4. Tauri command | src-tauri/src/overdrive/chat_orchestrator.rs | chat_send_message() | ChatRequest | ChatResponse | Rust | PASS | LOW |
| 5. Provider availability | src-tauri/src/overdrive/chat_orchestrator.rs | is_provider_available() | provider str | bool | Rust | **WAS STALE — FIXED** | WAS HIGH |
| 6. Failure counter | src-tauri/src/overdrive/chat_orchestrator.rs | provider_failure_count | — | count | Rust HashMap | **WAS NOT RESET — FIXED** | WAS HIGH |
| 7. Actual request | src-tauri/src/overdrive/chat_orchestrator.rs | send_to_ollama() | request | Result | Rust | PASS | LOW |
| 8. Success reset | src-tauri/src/overdrive/chat_orchestrator.rs | reset_provider_failures() | provider str | () | Rust | PASS | LOW |
| 9. Failure incr | src-tauri/src/overdrive/chat_orchestrator.rs | increment_provider_failures() | provider str | () | Rust | **WAS LOG LYING — FIXED** | WAS MED |
| 10. UI status | IPC response payload | provider field | — | UI label | IPC | PASS | LOW |

## Cloud Providers (Secondary Path — TS circuit breaker)

| Hop | File | Function | Input | Output | Owner | Truth Status | Stale Risk |
|-----|------|----------|-------|--------|-------|-------------|------------|
| 1-3 | same as above | — | — | — | — | — | — |
| 4. TS engine | src/services/ai/chatEngine.ts | generate() | request | response | TS | PASS | LOW |
| 5. Circuit check | src/services/ai/circuitBreaker.ts | canExecute() | provider str | bool | TS | PASS | LOW |
| 6. Record failure | src/services/ai/circuitBreaker.ts | recordFailure() | provider str | () | TS | PASS | LOW |
| 7. Record success | src/services/ai/circuitBreaker.ts | recordSuccess() | provider str | () | TS | **WAS PARTIAL — FIXED** | WAS MED |
| 8. CLOSED success | circuitBreaker.ts line 203 | recordSuccess CLOSED | — | failures-- | TS | **WAS DRIFT — FIXED** | WAS MED |
