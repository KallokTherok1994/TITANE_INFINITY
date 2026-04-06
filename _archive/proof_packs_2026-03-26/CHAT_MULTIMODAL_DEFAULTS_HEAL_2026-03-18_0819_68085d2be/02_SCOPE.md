# 02 — SCOPE

## Files in scope
- `src/utils/APISupport.ts` — Device detection utility
- `src/services/ai/responsePolicy.ts` — Canonical response profile source
- `src/core/prompts/providers.ts` — Provider token budget overrides
- `src/components/chat/ChatToolbar.tsx` — Bottom controls (read-only, no changes needed)
- `src/components/chat/ChatInput.tsx` — Simple chat input with voice toggle (read-only)
- `src-tauri/src/main.rs` — Tauri command registry (read-only)
- `src-tauri/capabilities/audio_tts.json` — Audio IPC permissions (read-only)

## Files NOT in scope (investigated, no changes needed)
- `src/core/prompts/profiles.ts` — Persona profiles, no change needed
- `src/core/prompts/constitution.ts` — Supreme laws, no change needed
- `src-tauri/src/` audio/voice modules — Rust backend, not broken for mic
- `src-tauri/capabilities/chat_ai.json` — Chat commands, correct

## Ring boundaries preserved
- Ring 1 (Core logic): responsePolicy.ts patched — value changes only
- Ring 4 (Frontend/UI): APISupport.ts patched — logic fix only
- No cross-ring imports introduced
