# SCOPE — AUDIO VOICE RECERTIFICATION

## Files Under Audit

| File                                                 | Role                                            | Changed by patch? |
| ---------------------------------------------------- | ----------------------------------------------- | ----------------- |
| `src/services/tts/hybridTTS.ts`                      | Frontend TTS dispatcher + fallback chain        | YES               |
| `src-tauri/src/tts/local_tts.rs`                     | Rust local TTS engine (piper/espeak)            | YES               |
| `src/components/sections/ConversationSection.tsx`    | Chat UI → hybridTTS.speak() trigger             | NO                |
| `src/features/audio-center/services/audioService.ts` | Voice config persistence + getTTSSettings()     | NO                |
| `src/features/audio-center/titaneVoiceProfiles.ts`   | Profile normalization                           | NO                |
| `src-tauri/src/audio/commands.rs`                    | Tauri `tts_speak` + `speak` commands            | NO                |
| `src-tauri/src/chat_engine/speech.rs`                | SpeechOrchestrator                              | NO                |
| `src-tauri/src/chat_engine/commands.rs`              | IPC `speak_text` handler                        | NO                |
| `src/services/tauri/chatEngine.commands.ts`          | Frontend IPC wrapper for speak_text             | NO                |
| `src-tauri/src/conversation_engine/commands.rs`      | OMEGA pipeline (active chat path) — NO auto-TTS | NO                |

## Architecture Context

Primary user-facing chat path uses **OMEGA pipeline** (`conversation_generate`):

```
ConversationSection → useConversationEngine → conversationEngine.ts
→ IPC conversation_generate → conversation_engine/commands.rs
→ (NO backend auto-TTS in this path)
→ response returns to frontend
→ hybridTTS.speak() [now with enrichConfigWithStoredVoice]
```

Legacy `generate_response` path (chat_engine/mod.rs) has auto-TTS with `voice: None` but is **not used by the OMEGA frontend** — confirmed by migration stub in main.rs:

```rust
// main.rs:978
// STUB: send_message is not implemented. Use conversation_generate instead.
```

## Risk Assessment

- Primary path: FIXED by patch ✅
- OMEGA pipeline: No auto-TTS, no voice bypass ✅
- Legacy chat_engine auto-TTS: voice:None, but DORMANT (OMEGA path used) ⚠️ documented
- piper binary + 2 French models: INSTALLED ✅
- Amy (en_US) model: MISSING — graceful fallback with warning log ✅
