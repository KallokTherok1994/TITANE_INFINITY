# SCOPE

**Mission:** Audio / TTS / Microphone / Desktop E2E Certification  
**HEAD start:** 8af44abed | **HEAD end:** 17838b9b1  
**Scope Ring:** Ring 4 (Tauri Desktop + Audio Backend) cross-cutting to Ring 3 (Frontend Services)

## In Scope

- TTS synthesis chain (piper primary, espeak fallback)
- Microphone test chain
- Speaker/output test chain
- Chat read-aloud button and TTS controls (pause/resume/stop)
- Audio center surface (Admin > Audio tab)
- Desktop E2E authority (WDIO + tauri-driver + WebKitWebDriver)
- Browser E2E (Playwright audio-truth.spec.ts mock mode)
- Binary freshness verification
- AutoHeal governance

## Out of Scope (per PARTIAL verdicts below)

- Voice identity perceptual proof (requires human listening test)
- VAD end-to-end coverage
- Recording/transcription end-to-end
- Audio config persistence reload verification
- tts_generate_test_buffer TITANE_E2E_FULL=1 (Tauri WebView Playwright mode — requires separate Playwright+Tauri setup)

## Files Touched This Session

| File                                                     | Change                                         |
| -------------------------------------------------------- | ---------------------------------------------- |
| src/services/tts/hybridTTS.ts                            | Add 'fallback' event, pass detail to listeners |
| src-tauri/src/chat_engine/mod.rs                         | Use fr_FR-siwis-medium for auto-TTS voice      |
| src/App.tsx                                              | Remove STATS nav item (v29.1 fusion)           |
| e2e/desktop/page-objects/uiPages.po.js                   | Remove uiPages.stats from topLevelPageOrder    |
| e2e/critical/engine-navigation.spec.ts                   | nav-stats → nav-dev (v29.1)                    |
| scripts/autoheal/autoheal_rules.jsonl                    | Append AH-2026-03-17-DEV-STATS-FUSION-FINAL    |
| src-tauri/target/release/titane-infinity                 | Rebuilt (binary)                               |
| proof_packs/AUDIO_TTS_MIC_E2E_2026-03-17_2300_8af44abed/ | Created (this proof pack)                      |
