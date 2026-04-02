# SCOPE

## Files patched
1. src/features/transformation/TransformationRoadmap.tsx
   - v28.0 features: updated to match providers.rs reality (Ollama, Gemini, auto-fallback)
   - v29.0: status planned/0% → in-progress/35% Q2/2026, features match actual audio stack

2. src/components/sections/TransformationSection.tsx
   - Paliers Franchis: added v26.0, v27.0, v28.0 milestones (was frozen at v25.3)
   - Added DISPLAY_ONLY disclosure paragraph

## Files read (investigation)
- src/features/transformation/TransformationRoadmap.tsx
- src/components/sections/TransformationSection.tsx
- src/pages/TitanePage.tsx (Transform tab mount)
- src/pages/EvoPage.tsx (inline TransformationSection — separate cognitive component)
- src/features/transformation/__tests__/TransformationRoadmap.test.tsx
- src-tauri/src/chat_engine/providers.rs (multi-provider reality)
- src-tauri/src/audio/commands.rs, whisper_streaming.rs, voice_fingerprint.rs
- src/services/tts/ (hybridTTS.ts, piper, etc.)
