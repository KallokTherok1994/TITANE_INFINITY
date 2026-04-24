# GATE REPORT

- Session: AUDIO_VOICE_PROFILE_SYNC_V10_2026-03-17_1747_be2cc878c
- Date: 2026-03-17
- Head: be2cc878c

## Mandatory Gates

1. G_AH_RECURRENCE_GUARD_PASS: PASS — entries=404, no recurrence detected
2. verify_instructions summary PASS=20 FAIL=0: PASS
3. verify:tauri-only: PASS — ✅ Tauri-only enforced: 0 erreurs
4. verify:tauri-configs: PASS — ✅ Configurations Tauri valides
5. Rust voice profile test (test_voice_profile_manager_get_active): PASS — 1/1
6. TS TTS runtime policy tests (audioService.runtimeTtsPolicy.test.ts): PASS — 4/4
7. BUILD_TAURI_E2E: PASS — EXIT_CODE=0, ✓ built in 12.75s, Finished release profile in 6m27s
8. DESKTOP_E2E_ONLINE: PASS — wdio close: code=0 signal=null, metrics verdict=PASS
9. DESKTOP_E2E_OFFLINE_SIM: PASS — OFFLINE_SIM=1, wdio close: code=0 signal=null, metrics verdict=PASS

## Executed Proof Commands (in order)

1. cargo test test_voice_profile_manager_get_active -- --nocapture
2. pnpm exec vitest run src/**tests**/features/audio/audioService.runtimeTtsPolicy.test.ts
3. pnpm run build:tauri:e2e > /tmp/v10_build.log 2>&1
4. env TITANE_E2E=1 TAURI_BINARY_PATH=src-tauri/target/release/titane-infinity TITANE_E2E_ARTIFACTS_DIR=/tmp/titane-voice-v10-proof-v10-online WDIO_SPEC=./e2e/desktop/audio-tts-runtime-controls.wdio.test.js pnpm -s e2e:desktop:run
5. env TITANE_E2E=1 OFFLINE_SIM=1 TAURI_BINARY_PATH=src-tauri/target/release/titane-infinity TITANE_E2E_ARTIFACTS_DIR=/tmp/titane-voice-v10-proof-v10-offline WDIO_SPEC=./e2e/desktop/audio-tts-runtime-controls.wdio.test.js pnpm -s e2e:desktop:run
6. bash scripts/autoheal/detect_recurrence.sh
7. bash scripts/verify_instructions.sh
8. pnpm run verify:tauri-only
9. pnpm run verify:tauri-configs

## Changed Scope (V10)

- src-tauri/src/identity/voice_profile.rs
- src/entry.ts
- src/main.tsx
- scripts/autoheal/autoheal_rules.jsonl
- reports/audio/TITANE_VOICE_SPEC_V10.json
- reports/audio/TITANE_VOICE_BENCHMARK_V10_2026-03-17.json

## Technical Truth (V10 Runtime)

- Desktop binary cross-certified online (Ollama live) and offline (OFFLINE_SIM=1): PASS
- TTS pause/resume/stop/relire path fully executed (not just "completed-too-fast"): PASS
- assistantMessageDetected: true in online run: PASS
- Audio center visible with speaker + microphone controls: PASS
- Boot hydration from backend active profile (identity_get_active_voice_profile injected at boot): PASS
- AutoHeal guard stable at entries=404 with no recurrence: PASS

## Evidence Artifacts

- Binary: src-tauri/target/release/titane-infinity (freshly built 2026-03-17)
- Online metrics: /tmp/titane-voice-v10-proof-v10-online/metrics.json
- Offline metrics: /tmp/titane-voice-v10-proof-v10-offline/metrics.json
- Build log: /tmp/v10_build.log

## Residual Risk

- Human perceptual scoring remains unproven locally and still requires an explicit listening protocol.
- Sample-style proximity remains BLOCKED without a target user sample and human scoring.
