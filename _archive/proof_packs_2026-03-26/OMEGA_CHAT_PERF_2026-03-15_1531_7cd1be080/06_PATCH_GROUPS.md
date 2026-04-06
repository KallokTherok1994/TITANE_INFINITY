# PATCH GROUPS

## A — Profile System (ChatProfile enum)
File: src-tauri/src/chat_engine/config.rs
- Added: ChatProfile { Fast, Balanced, Deep }
- Added: ChatEngineConfig::for_profile(profile) constructor
- Default: Balanced
- Rollback: git restore -- src-tauri/src/chat_engine/config.rs

## B — Stage Timeouts
File: src-tauri/src/chat_engine/config.rs, mod.rs
- Added: first_token_timeout per profile
- Added: memory_fetch_timeout per profile
- Applied: time::timeout(cfg.memory_fetch_timeout, ...) around context_window()
- Applied: time::timeout(cfg.response_timeout, ...) around providers.dispatch()
- Rollback: git restore -- src-tauri/src/chat_engine/config.rs src-tauri/src/chat_engine/mod.rs

## C — Bounded Retry/Fallback
File: src-tauri/src/chat_engine/config.rs
- Added: max_retry_chain: u8 (BALANCED=1, FAST=1, DEEP=1)
- Added: max_fallback_chain: u8 (BALANCED=1, FAST=1, DEEP=1)
- Note: actual retry logic in providers not yet wired (engine dispatches once); these fields bound future extension
- Rollback: same as B

## D — Memory Discipline (BALANCED defaults corrected)
File: src-tauri/src/chat_engine/config.rs
- memory_context_tokens: 2048 → 3584 (BALANCED midpoint)
- memory_retention_tokens: 3000 → 10000 (BALANCED midpoint)
- Rollback: same as B

## E — Streaming Truth
File: src-tauri/src/chat_engine/config.rs, mod.rs
- stream_chunk_size: 480 → 832 (BALANCED)
- stream_channel_buffer: 32 → 56 (BALANCED)
- done-chunk now carries stop_reason + profile
- Rollback: same as B

## F — UI / Meta Truth
Files: src-tauri/src/chat_engine/types.rs, src/services/tauri/chatEngine.commands.ts
- Added: stop_reason field to ChatCompletionPayload (Rust + TS)
- Added: profile field to ChatCompletionPayload (Rust + TS)
- Added: profile field to ChatRequestPayload (Rust) and ChatRequestArgs + OmegaGenerateArgs (TS)
- Rollback: git restore -- src-tauri/src/chat_engine/types.rs src/services/tauri/chatEngine.commands.ts

## G — OMEGA Speed Intelligence
File: src-tauri/src/chat_engine/mod.rs
- Profile resolved per-request from payload.profile field
- Per-profile config applied for all stage timeouts and memory budgets
- Default profile = Balanced (not Deep)
- Rollback: git restore -- src-tauri/src/chat_engine/mod.rs
