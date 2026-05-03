# VOICE BYPASS MATRIX

All active speech entry points audited as of HEAD 8af44abed.

| Entry Point | File:Line | Bypasses enrichment? | Bypasses provider routing? | Active in desktop? | Risk |
|------------|-----------|---------------------|--------------------------|-------------------|------|
| `hybridTTS.speak()` via chat auto-play | `ConversationSection.tsx:1356` | ❌ NO — enrichConfigWithStoredVoice() injects voice | ❌ NO | YES | LOW — FIXED |
| `hybridTTS.speak()` via per-message button | `MessageListOptimized.tsx:85` | ❌ NO — same enrichment | ❌ NO | YES | LOW — FIXED |
| `hybridTTS.speak()` via VoiceControlPanel | `VoiceControlPanel.tsx:57` | Partially — may pass own config | ❌ NO | YES | LOW — enriched |
| `hybridTTS.speak()` via voiceRouter | `voiceRouter.ts:346` | ❌ NO — empty config → enriched | ❌ NO | YES | LOW — FIXED |
| `hybridTTS.speak()` via emotionalTTS | `emotionalTTS.ts:62,75,87` | Passes own voice/lang | ❌ NO | YES | LOW — overrides intentional |
| `hybridTTS.speak()` via fullDuplexOrchestrator | `fullDuplexOrchestrator.ts:147,167` | ❌ NO — empty config | ❌ NO | YES | LOW — FIXED |
| `audioService.speak()` via messageSpeechController | `messageSpeechController.ts` | N/A — reads stored settings | N/A | YES | LOW — correct |
| `chatEngineSpeakText()` direct IPC | Only via hybridTTS.speakTauri() | N/A | N/A | YES (indirect) | LOW |
| `secureInvoke('speak', ...)` direct | None found in active code | N/A | N/A | NO | NONE |
| Backend auto-TTS `generate_response` | `chat_engine/mod.rs:151,265` | YES — voice:None | YES — ignores user voice | ⚠️ DORMANT | MED (if activated) |
| OMEGA pipeline auto-speak | `conversation_engine/commands.rs` | N/A — no auto-TTS in this path | N/A | YES (OMEGA) | NONE |

## Summary
- **Active bypasses that affect voice selection: 0** (all active paths enriched or fixed)
- **Dormant bypass: 1** (backend auto-TTS in legacy path, not reachable from OMEGA frontend)
- **Intentional overrides: 1** (emotionalTTS passes its own voice/lang for prosody — by design)
