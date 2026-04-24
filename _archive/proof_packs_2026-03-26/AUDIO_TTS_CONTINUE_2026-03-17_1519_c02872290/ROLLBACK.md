# ROLLBACK

Use only if this audio/TTS continuation lane must be reverted.

## Code Rollback

1. git restore -- src-tauri/src/identity/voice_profile.rs
2. git restore -- src/features/audio-center/AudioCenterPage.tsx
3. git restore -- src/features/audio-center/titaneVoiceProfiles.ts
4. git restore -- src/**tests**/features/audio/titaneVoiceProfiles.test.ts
5. git restore -- scripts/autoheal/autoheal_rules.jsonl

## Proof Rollback

1. git restore -- proof_packs/AUDIO_TTS_CONTINUE_2026-03-17_1519_c02872290

## Safety Note

- Runtime logs in reports/e2e-desktop are evidence artifacts and can remain locally after code rollback.
