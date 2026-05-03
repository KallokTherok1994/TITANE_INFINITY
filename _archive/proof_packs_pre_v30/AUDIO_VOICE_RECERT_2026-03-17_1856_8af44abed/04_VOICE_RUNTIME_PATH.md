# VOICE RUNTIME PATH — FULL 9-HOP CHAIN

## Primary Desktop Path (OMEGA Pipeline)

| Hop | File | Function | Input | Voice Passed? | Bypass Risk |
|-----|------|----------|-------|--------------|-------------|
| 1 | `AudioCenterPage.tsx` | voice profile select | User clicks voice | Stored to localStorage | None |
| 2 | `audioService.ts:updateTTSSettings()` | voice settings persist | voiceId, engine | Written to this.config.tts | None |
| 3 | `ConversationSection.tsx:1356` | `hybridTTS.speak(text, {rate, pitch, lang})` | No voice field | ❌ caller omits voice | Enriched by step 4 |
| 4 | `hybridTTS.ts:enrichConfigWithStoredVoice()` | reads audioService | stored voiceId | ✅ injected from storage | None — patch |
| 5 | `hybridTTS.ts:speakTauri()` | `chatEngineSpeakText({voice: enrichedConfig.voice})` | voice=voiceId | ✅ forwarded | None |
| 6 | `chatEngine.commands.ts:speakText()` | `secureInvoke('speak_text', {voice})` | voice=voiceId | ✅ forwarded | None |
| 7 | `chat_engine/commands.rs:speak_text()` | `engine.speak_text(text, mode, speed, pitch, voice)` | voice=Some(voiceId) | ✅ forwarded | None |
| 8 | `chat_engine/speech.rs:SpeechOrchestrator::speak()` | `TTSRequest { voice: task.voice }` | voice=Some(voiceId) | ✅ forwarded | None |
| 9 | `tts/local_tts.rs:speak()` → `speak_piper()` | dynamic engine + model | voice=Some(voiceId) | ✅ model=voiceId.onnx | Missing .onnx → fallback |

## Voice Preserved End-to-End: ✅ YES (all 9 hops verified)

## Per-Message Play Path (secondary)

| Hop | Path |
|-----|------|
| 1 | `messageSpeechController.playMessage()` |
| 2 | `audioService.speak()` → reads stored voiceId from config |
| 3 | `tauriClient.ttsSpeak(settings)` → IPC `tts_speak` |
| 4 | `audio/commands.rs:tts_speak()` → uses `settings.voice_id` |
| 5 | Direct to speak_piper or speak_espeak with voice_id |

**Voice preserved: ✅ YES (separate path, reads stored settings directly)**

## Backend Auto-TTS Path (dormant)

| Status | Path |
|--------|------|
| ⚠️ DORMANT | `chat_engine/mod.rs:generate_response()` → `SpeechTask{voice: None}` |
| WHY DORMANT | OMEGA frontend uses `conversation_generate`, NOT `generate_response` |
| RISK | Only activates if legacy `generate_response` command is called directly |
| MITIGATION | main.rs stub: "send_message STUB — use conversation_generate" |
