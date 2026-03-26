# TRANSFORM OUTDATEDNESS ANALYSIS

## 1. Canonical Transform definition
There is no live canonical Transform model. The page is an intentional DISPLAY_ONLY roadmap.
The authoritative canon is: "curated milestones must accurately reflect the real code state at verification date."

## 2. Outdatedness classification
- **roadmap drift**: Paliers Franchis frozen at v25.3 while repo is at v28.0
- **UI drift**: v29 "Voice & Audio Premium" shown as planned/0% while TTS/STT already partially implemented
- **stale source drift**: v28 features listed Claude/ElevenLabs (aspirational) instead of Ollama/Gemini/Piper (actual)
- **missing new milestones**: v26, v27, v28 not in Paliers Franchis card

## 3. Current canonical Transform model
File: src/features/transformation/TransformationRoadmap.tsx → generateMockMilestones()
- This IS the canonical model (curated, manually maintained, DISPLAY_ONLY)
- Previous fix: ded220ae9 (2026-03-14/15)
- This fix: 2026-03-18

## 4. Files reflecting old Transform model (pre-patch)
- src/components/sections/TransformationSection.tsx: Paliers Franchis at v25.3, no disclosure
- src/features/transformation/TransformationRoadmap.tsx: v28/v29 aspirational features

## 5. Widgets/labels/versions that were obsolete/misleading
- v28.0 features: "Claude, Gemini" → Ollama+Gemini are real; Claude is not implemented
- v29.0: planned/0% → in-progress/35% with actual Piper TTS + Whisper + voice fingerprint + hybridTTS
- Paliers Franchis: missing v26.0 (Vision), v27.0 (Identité), v28.0 (in-progress)

## 6. Version authority classification
v25.0–v27.0: roadmap truth (completed, consistent with code)
v28.0: roadmap truth (in-progress, features now aligned with providers.rs)
v29.0: roadmap truth (in-progress, features now aligned with audio stack)
v30.0: aspirational/future (explicitly marked 'future')
→ None are "live runtime truth" — all are curated/DISPLAY_ONLY, now properly disclosed
