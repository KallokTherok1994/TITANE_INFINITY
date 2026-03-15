# SCOPE

## Rings Touched
- R2: ChatEngineConfig, ChatProfile, stage timeouts, budgets
- R3: mod.rs (generate_response, stream_response), types.rs, chatEngine.commands.ts
- R4: ChatCompletionPayload.stopReason, ChatCompletionPayload.profile (UI meta truth)

## Tauri Commands Implicated
- generate_response (modified: profile-aware + stage timeouts + stop_reason)
- stream_response (modified: profile-aware + stage timeouts + profile in done-chunk)
- save_memory / load_memory / reset_memory / health_check (unchanged)

## OMEGA Modules
- cognitiveOmegaIntegration.ts (NOT modified — feeds into conversation pipeline above chat engine layer)
- chatEngine.commands.ts (modified: profile, maxTokens, stop_reason)

## Network Surfaces
- AIRouter (Gemini / Ollama / Local) — unchanged routing logic
- All timeouts now bounded per profile
