# GATES REPORT

| Gate                     | Status     | Evidence                                                                                                                           |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| G_BOOT_TRUTH             | ✅ PASS    | HEAD=8af44abed; node=v18.19.1; cargo=1.94.0; piper binary confirmed; 2 FR models confirmed; espeak-ng present                      |
| G_PATCH_CLAIMS_REVIEWED  | ✅ PASS    | All 5 claims classified; A-D PROVEN_STATIC; E STATIC_FIX_NOT_RUNTIME_PROVEN                                                        |
| G_RUNTIME_PATH_MAPPED    | ✅ PASS    | Full 9-hop chain mapped; voice preserved at every hop; OMEGA path (no auto-TTS) confirmed                                          |
| G_CHAT_PATH_PROVEN       | ✅ PASS    | ConversationSection→hybridTTS.speak() enriches config automatically; no caller change required                                     |
| G_PROVIDER_TRUTH_VISIBLE | ✅ PASS    | `[TTS:BOOTSTRAP]` group logs selectedVoice, engine, enriched voice, VOICE_MAP label at every speak() call                          |
| G_MODEL_TRUTH_VISIBLE    | ✅ PASS    | `log::info!("[LocalTTS] speak_piper model: {}", model_path)` in local_tts.rs:145                                                   |
| G_FALLBACK_HONESTY       | ⚠️ PARTIAL | Model missing: log::warn ✅; piper binary missing: logged only ✅; no user-facing UI notification for any fallback ⚠️              |
| G_TWO_VOICE_DIFFERENCE   | ❌ BLOCKED | Two FR piper models INSTALLED (siwis+upmc); code path routes to different .onnx; perceptual proof requires human desktop listening |
| G_DESKTOP_TARGET_TRUTH   | ⚠️ PARTIAL | Prior cert V10 PASS; current HEAD not re-run through desktop E2E build+run                                                         |
| G_NO_ACTIVE_BYPASS       | ✅ PASS    | No active speech bypass found; backend auto-TTS (voice:None) is DORMANT on OMEGA path; emotionalTTS override is by design          |
| G_ROLLBACK_READY         | ✅ PASS    | `git restore -- src/services/tts/hybridTTS.ts src-tauri/src/tts/local_tts.rs` verified and documented                              |

## Gate Summary

- PASS: 7
- PARTIAL: 2 (G_FALLBACK_HONESTY, G_DESKTOP_TARGET_TRUTH)
- BLOCKED: 1 (G_TWO_VOICE_DIFFERENCE)
- FAIL: 0
