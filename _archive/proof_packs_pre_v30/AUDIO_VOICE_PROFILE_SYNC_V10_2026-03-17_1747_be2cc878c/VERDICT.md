# VERDICT

- Session: AUDIO_VOICE_PROFILE_SYNC_V10_2026-03-17_1747_be2cc878c
- VERDICT_UNIQUE: PASS
- Updated: 2026-03-17T17:47:00

## Layered Statuses

1. ACTIVE_PROFILE_IPC_SURFACE: PASS — getter constant, client wrapper, handler registration, frontend whitelist, and stable allowlist aligned and verified V9→V10.
2. FRONTEND_BOOTSTRAP_SYNC: PASS — backend active profile hydration confirmed at startup.
3. MANUAL_TUNING_PRESERVATION: PASS — non-default manual tuning without voiceProfileId is not overwritten.
4. TARGETED_UNIT_PROOF: PASS — audioService runtime policy test suite passed 4/4.
5. RUST_VOICE_PROFILE_TEST: PASS — test_voice_profile_manager_get_active passed 1/1.
6. BUILD_TAURI_E2E: PASS — pnpm run build:tauri:e2e EXIT_CODE=0, fresh release binary built.
7. DESKTOP_RUNTIME_E2E_ONLINE: PASS — wdio close code=0, pauseResumePath=executed, verdict=PASS, ttsStatusAfterRead="Lecture en cours...", ttsStatusFinal="Lecture arrêtée.".
8. DESKTOP_RUNTIME_E2E_OFFLINE_SIM: PASS — OFFLINE_SIM=1, wdio close code=0, metrics verdict=PASS, full TTS control observation confirmed.
9. GOVERNANCE_GATES: PASS — detect_recurrence entries=404, verify_instructions PASS=20 FAIL=0, verify:tauri-only ✅, verify:tauri-configs ✅.
10. HUMAN_PERCEPTUAL_CERTIFICATION: BLOCKED — listening protocol still required.
11. SAMPLE_STYLE_PROXIMITY: BLOCKED — no user target sample certification.

## V10 Delta vs V9

- V9 had DESKTOP_RUNTIME_RECERT_THIS_SESSION: BLOCKED — rerun was blocked in that patch session.
- V10 closes this gap: full fresh binary build + desktop E2E online + offline both PASS.
- pauseResumePath upgraded from "completed-too-fast" (prior tmp runs) to "executed" in this session.
- assistantMessageDetected: true (online) — Ollama online and responsive during V10 proof.

## E2E Metrics (both online and offline)

```json
{
  "assistantMessageDetected": true,
  "ttsControlsVisible": true,
  "ttsStatusAfterRead": "Lecture en cours...",
  "ttsStatusFinal": "Lecture arrêtée.",
  "pauseResumePath": "executed",
  "stopActionObserved": true,
  "replayButtonObserved": true,
  "audioCenterVisible": true,
  "speakerButtonVisible": true,
  "microphoneButtonVisible": true,
  "speakerResultObserved": true,
  "microphoneResultObserved": true,
  "verdict": "PASS"
}
```

## Evidence Paths

- Online: /tmp/titane-voice-v10-proof-v10-online/
- Offline: /tmp/titane-voice-v10-proof-v10-offline/
- Binary: src-tauri/target/release/titane-infinity (built 2026-03-17T21:45Z)

## Conclusion

- All 9 auto-provable gates PASS.
- Desktop runtime recertification (online + offline) completed and sealed for V10.
- Remaining blockers are perceptual proof blockers requiring human listening protocol.
- V10 is the first version in this chain with full desktop E2E recertification in the same session.
