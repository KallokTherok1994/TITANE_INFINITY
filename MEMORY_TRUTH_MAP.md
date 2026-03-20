# MEMORY_TRUTH_MAP

## Required truth chain
- Save real
- Persist real
- Retrieve real
- Inject real
- Consume real

## Frontend memory injection truth
- File: `src/services/conversationEngine.ts`
- Added explicit persistent memory state marker in prompt:
  - `PERSISTENT_MEMORY_STATUS=loaded|empty|unavailable`
- Silent catch removed in favor of explicit warning + status fallback.

## Backend history load truth
- File: `src-tauri/src/conversation_engine/commands.rs`
- Added explicit markers:
  - `history_load_status`
  - `history_message_count`
  - `history_load_error`
- Markers are now propagated in trace and response metadata.
- Explicit failure class added when history load fails.

## Runtime consumption truth (desktop proof)
- DOM provider marker observed on assistant row: `data-provider-used=Ollama`
- Runtime panel aligned with assistant row:
  - provider `Ollama`
  - network `false`
  - reason `OK`
- Assistant content rendered in UI under `chat-message-content`.

## Known residual risk
- Backend metadata alignment fields were empty in one UI probe (`UI_BACKEND_ALIGNMENT`), while DOM/runtime panel were consistent.
- This is a visibility gap to keep under watch, not a hard failure for response generation path.