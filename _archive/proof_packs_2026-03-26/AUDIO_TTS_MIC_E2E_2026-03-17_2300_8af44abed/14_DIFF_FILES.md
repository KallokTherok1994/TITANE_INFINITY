# DIFF FILES
**HEAD:** 17838b9b1 | Compared to prior cert HEAD: 8af44abed

## Changes This Session (commit 6c9a21402)

### src-tauri/src/chat_engine/mod.rs (+4 lines, -2 lines)
```diff
- voice: None,
+ // Use default piper FR voice to avoid robotic espeak when auto-TTS fires
+ voice: Some("fr_FR-siwis-medium".to_string()),
```
(Applied in 2 places: generate_response + stream path)

**Impact:** Auto-TTS via backend chat engine now uses siwis piper voice instead of None→espeak fallback. More natural voice when auto-TTS fires from OMEGA pipeline.

### src/services/tts/hybridTTS.ts (+22 lines, -5 lines)
- Added `'fallback'` to TTSEventType
- TTSEventListener now receives optional `detail?: string`
- emitEvent() now passes detail to listeners
- Import `useUIStore` added

**Impact:** Frontend can now receive fallback event with reason string. Enables anti-lie: UI knows when TTS fell back and can show honest degraded state.

### src/App.tsx (-9 lines)
- Removed Stats lazy import (dead code since /stats → /dev redirect)
- Removed STATS nav item from topNavSections

### e2e/desktop/page-objects/uiPages.po.js (-1 line)
- Removed uiPages.stats from topLevelPageOrder

### e2e/critical/engine-navigation.spec.ts (-7 lines, +8 lines)
- nav-stats → nav-dev in 3 places
- Comment updated: STATS fusionné DEV v29.1

### scripts/autoheal/autoheal_rules.jsonl (+1 entry)
- AH-2026-03-17-DEV-STATS-FUSION-FINAL appended

## Prior Session Changes Still In Effect (commit 8af44abed)
- src-tauri/src/audio/commands.rs: Added `tts_generate_test_buffer` (~107 lines)
- src-tauri/src/main.rs: Registered tts_generate_test_buffer
- src-tauri/tauri.conf.json: Added tts_generate_test_buffer to capabilities allow list
- e2e/audio-truth.spec.ts: New Playwright spec (STEP3-8 audio truth)
- e2e/fixtures/tauri-ipc-mock*.{js,ts}: Mock for tts_generate_test_buffer

## Binary Delta (compared to prior cert at df3147c64)
- audio/commands.rs: +107 lines (tts_generate_test_buffer)
- chat_engine/mod.rs: +4/-2 lines (voice binding fix)
Both compiled and linked in incremental build.
