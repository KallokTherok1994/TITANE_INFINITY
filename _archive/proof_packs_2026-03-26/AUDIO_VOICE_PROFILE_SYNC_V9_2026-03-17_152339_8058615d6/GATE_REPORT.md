# GATE REPORT

- Session: AUDIO_VOICE_PROFILE_SYNC_V9_2026-03-17_152339_8058615d6
- Date: 2026-03-17
- Head: 8058615d6

## Mandatory Gates

1. G_AH_RECURRENCE_GUARD_PASS: PASS
2. verify_instructions summary PASS=20 FAIL=0: PASS
3. verify:tauri-only: PASS
4. verify:tauri-configs: PASS
5. targeted audio runtime policy test: PASS
6. IPC contract test: PASS

## Executed Proof Commands

1. pnpm exec vitest run src/**tests**/features/audio/audioService.runtimeTtsPolicy.test.ts
2. pnpm run guard:ipc-contract
3. bash scripts/autoheal/detect_recurrence.sh
4. bash scripts/verify_instructions.sh
5. pnpm run verify:tauri-only
6. pnpm run verify:tauri-configs

## Changed Scope

- src/features/audio-center/services/audioService.ts
- src/features/audio-center/hooks/useAudio.ts
- src/**tests**/features/audio/audioService.runtimeTtsPolicy.test.ts
- src/lib/tauriCommands.ts
- src/lib/tauriClient.ts
- src/lib/security.ts
- src-tauri/src/main.rs
- src-tauri/allowlist.whitelist.stable.json

## Technical Truth

- Missing frontend getter surface for identity_get_active_voice_profile: CLOSED
- Missing frontend whitelist coverage for active voice profile commands: CLOSED
- Missing stable allowlist coverage for identity_get_active_voice_profile: CLOSED
- Frontend bootstrap drift when voiceProfileId was absent and defaults were raw: CLOSED
- Manual non-default tuning without explicit voice profile: PRESERVED

## Residual Risk

- Desktop runtime full recertification was not rerun in this specific V9 patch session.
- Human perceptual scoring remains unproven locally and still requires an explicit listening protocol.
- Sample-style proximity remains BLOCKED without a target user sample and human scoring.
