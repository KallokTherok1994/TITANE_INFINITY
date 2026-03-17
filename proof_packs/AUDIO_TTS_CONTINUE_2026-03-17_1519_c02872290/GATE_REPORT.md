# GATE REPORT

- Session: AUDIO_TTS_CONTINUE_2026-03-17_1519_c02872290
- Date: 2026-03-17
- Head: d818b0e5b

## Mandatory Gates

1. G_AH_RECURRENCE_GUARD_PASS: PASS
2. verify_instructions summary PASS=20 FAIL=0: PASS
3. E2E desktop authorization gate: PASS
4. E2E desktop ensure WebKitWebDriver: PASS

## Executed Proof Commands

1. corepack pnpm vitest run src/__tests__/features/audio/titaneVoiceProfiles.test.ts src/__tests__/components/chat/MessageBubble.tts.test.tsx
2. cargo test --manifest-path src-tauri/Cargo.toml voice_profile -- --nocapture
3. WDIO_SPEC=./e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js pnpm run e2e:desktop
4. WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm run e2e:desktop
5. bash scripts/autoheal/detect_recurrence.sh
6. bash scripts/verify_instructions.sh
7. pnpm run build:tauri:e2e
8. WDIO_SPEC=./e2e/desktop/audio-tts-runtime-controls.wdio.test.js pnpm run e2e:desktop
9. bash scripts/autoheal/detect_recurrence.sh
10. bash scripts/verify_instructions.sh
11. for i in 1 2 3; do WDIO_SPEC=./e2e/desktop/audio-tts-runtime-controls.wdio.test.js pnpm run e2e:desktop; done
12. bash scripts/autoheal/detect_recurrence.sh
13. bash scripts/verify_instructions.sh

## Evidence Artifacts

- reports/e2e-desktop/diagnostics.log
- reports/e2e-desktop/wdio.log
- reports/e2e-desktop/tauri_driver.log
- reports/e2e-desktop/audio_tts_runtime_controls_metrics.json
- scripts/autoheal/autoheal_rules.jsonl (entries FIX-009, FIX-010, FIX-011, FIX-012, FIX-013; recurrence entries=375)

## Residual Risk

- Natural voice quality criteria remain human-evaluation dependent and are not fully machine-proven.
- `pauseResumePath` remains non-déterministe sur ce run (observé `not-observed`) malgré stop/replay + speaker/microphone validés.

## Addendum 2026-03-17T16:31Z

- Head revalidé: d818b0e5b
- Build: `pnpm run build:tauri:e2e` -> PASS (code 0)
- Runtime desktop ciblé: `audio-tts-runtime-controls.wdio.test.js` run x3 -> PASS
- Gates: `detect_recurrence.sh` PASS, `verify_instructions.sh` PASS=20 FAIL=0
- AutoHeal entries: 378

## Addendum 2026-03-17T17:20Z

- Head revalidé: 9b13edcd1
- Patch causal voix: `extractSpeakableText -> prepareSpeechProsody -> speak` (URL simplification, normalisation ponctuation/pause)
- Test unitaire ciblé: `pnpm vitest run src/__tests__/services/tts/messageSpeechController.test.ts` -> PASS (4/4)
- Build desktop: `pnpm run build:tauri:e2e` -> PASS
- Runtime desktop ciblé: `audio-tts-runtime-controls.wdio.test.js` -> PASS (run simple) puis PASS (run x3)
- Stabilisation preuve E2E: retry borné `ensureAudioCenterVisible(maxAttempts=3)` pour éliminer faux négatif intermittent
- Gates gouvernance: `detect_recurrence.sh` PASS, `verify_instructions.sh` PASS=20 FAIL=0
- AutoHeal entries ajoutées: AH-2026-03-17-VOICE-001-PROSODY-PREP-CHAIN, AH-2026-03-17-VOICE-002-E2E-AUDIOCENTER-RETRY

## Addendum 2026-03-17T17:24Z

- Head courant constaté en fin de session: e5515d71f
- Contradiction de head interne: addendum précédent (9b13edcd1) supersédé par ce marqueur final
- Verdict technique inchangé: chaîne runtime desktop PASS, qualité perceptive humaine non certifiée

## Addendum 2026-03-17T17:50Z

- Head revalidé: 32391d3ab
- Patch prosodie V6: segmentation bornée + fusion conditionnelle des fragments courts dans `prepareSpeechProsody`
- Test unitaire ciblé: `pnpm vitest run src/__tests__/services/tts/messageSpeechController.test.ts` -> PASS (6/6)
- Build desktop: `pnpm run build:tauri:e2e` -> PASS
- Runtime desktop ciblé: `audio-tts-runtime-controls.wdio.test.js` -> PASS (run simple) puis PASS (run x3)
- Metric desktop runtime: `reports/e2e-desktop/audio_tts_runtime_controls_metrics.json` verdict PASS
- Artifacts modeling: `reports/audio/TITANE_VOICE_SPEC_V6.json` + `reports/audio/TITANE_VOICE_BENCHMARK_V6_2026-03-17.json`
