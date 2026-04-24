# ROLLBACK

## Code Rollback

1. git restore -- src/features/audio-center/services/audioService.ts
2. git restore -- src/features/audio-center/hooks/useAudio.ts
3. git restore -- src/**tests**/features/audio/audioService.runtimeTtsPolicy.test.ts
4. git restore -- src/lib/tauriCommands.ts
5. git restore -- src/lib/tauriClient.ts
6. git restore -- src/lib/security.ts
7. git restore -- src-tauri/src/main.rs
8. git restore -- src-tauri/allowlist.whitelist.stable.json
9. git restore -- reports/audio/TITANE_VOICE_SPEC_V9.json
10. git restore -- reports/audio/TITANE_VOICE_BENCHMARK_V9_2026-03-17.json
11. git restore -- scripts/autoheal/autoheal_rules.jsonl

## Proof Rollback

1. git restore -- proof_packs/AUDIO_VOICE_PROFILE_SYNC_V9_2026-03-17_152339_8058615d6

## Safety Note

- This rollback removes the active voice-profile hydration path and restores the prior raw frontend defaults on desktop boot when no explicit voice profile is stored.
