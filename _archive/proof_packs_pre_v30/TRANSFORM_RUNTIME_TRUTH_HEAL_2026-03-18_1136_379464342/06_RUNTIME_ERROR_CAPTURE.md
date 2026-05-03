# RUNTIME ERROR CAPTURE

## Pre-patch defects

### DEFECT 1: TRANSFORM_OUTDATED_UI — Paliers Franchis
File: src/components/sections/TransformationSection.tsx lines 94-104
Issue: Only v25.0–v25.3 listed. Repo is at v28.0. Missing 3 major completed/in-progress versions.
No disclosure label.
Classification: TRANSFORM_OUTDATED_UI + TRANSFORM_FALLBACK_LYING (ROADMAP_DRIFT)
Status: FIXED

### DEFECT 2: TRANSFORM_OUTDATED_UI — v29 milestone data
File: src/features/transformation/TransformationRoadmap.tsx lines 393-407
Issue: v29 "planned/0%" while substantial audio stack exists:
  - src-tauri/src/audio/{commands.rs, whisper_streaming.rs, voice_fingerprint.rs}
  - src/services/tts/{hybridTTS.ts, piper, ttsEngineService.ts}
v29 features listed: ElevenLabs, Whisper v3, Voice cloning, Audio analytics — aspirational
Actual implemented: Piper TTS local, Whisper streaming, voice fingerprinting, hybrid TTS
Classification: TRANSFORM_OUTDATED_UI (ROADMAP_DRIFT)
Status: FIXED (in-progress 35%, correct features)

### DEFECT 3: TRANSFORM_OUTDATED_UI — v28 milestone features
File: src/features/transformation/TransformationRoadmap.tsx lines 377-390
Issue: Features listed "Claude, Gemini" — Claude is NOT implemented. Actual: Ollama + Gemini + auto-fallback.
Classification: TRANSFORM_FALLBACK_LYING (UI_DRIFT)
Status: FIXED (Ollama+Gemini+auto-fallback, Claude→planned)

## No runtime crash found
Component mounts and renders correctly. No ErrorBoundary triggered. Tests pass 17/17.
