# SCOPE — CHAT_PROVIDER_TRUTH_RECOVERY

## Ring Impact

- Ring 3: Services (chat_orchestrator.rs, circuitBreaker.ts)
- Ring 4: UI/Tauri runtime (provider state propagated to UI via IPC)

## Files In Scope

1. `src-tauri/src/overdrive/chat_orchestrator.rs` — PRIMARY (Rust backend, Ollama circuit)
2. `src/services/ai/circuitBreaker.ts` — SECONDARY (TS cloud provider circuit)

## Files Out of Scope (not modified)

- All UI components (no behavior change needed — UI reflects provider state via existing channels)
- src-tauri/src/ai/router.rs (not the active Ollama path)
- src-tauri/src/api_hub/temporal_circuit_breaker.rs (not the active Ollama path)
- e2e/\*\* (desktop runtime not available)

## Provider Chain Active Path

- Ollama: Rust path via `chat_send_message` → `is_provider_available` → `send_to_ollama`
- Cloud (Gemini/OpenAI/Anthropic): TS path via `chatEngine.ts` → `circuitBreaker.ts`
- Mock build: mock_commands path (not the runtime showing the incident logs)
