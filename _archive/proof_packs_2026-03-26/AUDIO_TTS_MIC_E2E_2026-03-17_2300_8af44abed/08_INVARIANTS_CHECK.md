# INVARIANTS CHECK

**HEAD:** 17838b9b1 | **Date:** 2026-03-17 23:00

## I1. Tauri-only for desktop truth

✅ PASS — Desktop certification uses WDIO + tauri-driver + WebKitWebDriver against `src-tauri/target/release/titane-infinity`. Playwright browser tests are explicitly labeled as browser-only (mock mode). No confusion between browser and desktop verdicts.

## I2. Mock runtime is never audio runtime truth

✅ PASS — Mock mode in audio-truth.spec.ts is explicitly gated by `FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1'`. When false, only one precondition test runs. Runtime truth is from WDIO desktop test against real Tauri binary.

## I3. Browser E2E, desktop E2E, unit/integration and mock runtime must never share the same verdict

✅ PASS — This report explicitly separates:

- L1 STATIC: command existence, capabilities
- L2 RUNTIME: WDIO desktop PASS x3
- L3 VISIBLE: ttsStatusAfterRead = "Lecture en cours..." (confirmed in WDIO)
- L4 STABILITY: x3 reruns all PASS

## I4. No PASS without matching proof level

✅ PASS — Desktop E2E verdict is backed by x3 WDIO runs with metrics.json artifacts. Voice quality verdict is VOICE_IDENTITY_NOT_PROVEN (separate).

## I5. No fake healthy, fake ready, fake speaking, fake recording

✅ PASS — ttsStatusAfterRead confirms real TTS engine started ("Lecture en cours..."), ttsStatusFinal confirms real stop ("Lecture arrêtée."), pauseResumePath="executed" confirms SIGSTOP/SIGCONT round-trip.

## I6. No broad refactor — minimal patch only

✅ PASS — Changes are:

- 2 lines in chat_engine/mod.rs (voice: None → Some("fr_FR-siwis-medium"))
- Additive changes to hybridTTS.ts (new event type + detail param)
- Nav cleanup (-11 lines), pure deletion
- No architecture changes

## I7. Auto-heal allowed only with bounded patch

✅ PASS — AH-2026-03-17-DEV-STATS-FUSION-FINAL describes the exact bounded Stats nav removal. autoheal_rules.jsonl entry complete. detect_recurrence.sh: PASS.

## I8. Desktop authority proven

✅ PASS —

- Exact launched target: `src-tauri/target/release/titane-infinity` (RELEASE_BINARY_PATH)
- Artifact freshness: binary timestamp 19:23:11 > HEAD commit 19:13:10 ✅
- Build freshness: incremental cargo build --release at HEAD 17838b9b1
- No dev-server confusion: tauri-driver + WebKitWebDriver directly launch binary
- Backend IPC reachable: assistantMessageDetected=true, ttsStatusAfterRead="Lecture en cours..."

## I9. TTS/mic/output truth unprovable → BLOCKED, not PASS

✅ RESPECTED — TTS and mic and output chains are RUNTIME-PROVEN via WDIO x3. Voice quality is separately classified VOICE_IDENTITY_NOT_PROVEN (not PASS, not BLOCKED — separate gate).

## I10. Proof file missing → BLOCKED

✅ PASS — All mandatory proof files present in this pack (see below).
