# 04_INVARIANTS_CHECK.md — Vérification des invariants

## I1 — Tauri-only runtime

- PASS: Runtime de production est Tauri. Aucun dev server comme runtime.
- NOTE: hybridTTS.ts utilise Web Speech API comme dernier fallback (non silencieux).

## I2 — Pas d'appels web/audio directs depuis l'UI hors IPC

- FAIL: src/hooks/useAudioChat.tsx — SpeechRecognition (STT Web API), AudioContext, speechSynthesis fallback
- FAIL: src/core/realtime/RealTimeExecutionEngine.ts — new AudioContext() direct
- PARTIAL: src/services/tts/hybridTTS.ts — Web Speech API Stratégie 3 avec console.warn explicite
- NOTE: useVoice.ts DEPRECATED — marqué explicitement
- Verdict: I2 PARTIAL FAIL sur 2 surfaces actives

## I3 — 4-Ring strict

- PASS: Pas d'import inversé détecté dans les fixes appliqués
- Ring1/Ring2/Ring3/Ring4: architecturalement correct

## I4 — Pas de fake fallback

- FAIL: hybridTTS.ts — Tauri failed console.warn + fallback Web Speech API
- FAIL: useAudioChat.tsx — tts_speak failed fallback speechSynthesis (log catch)
- PASS: audio/commands.rs::tts_speak fallback piper-espeak conditionnel et documenté

## I5 — Pas de swallow silencieux d'erreurs

- PASS: audio/commands.rs erreurs propagées via Err(String)
- FIXED: UnifiedCognitivePipeline.ts TypeError sous-jacent (fix 2026-03-15)
- PARTIAL: RealTimeExecutionEngine.ts console.error mais retourne [] sans remonter à l'UI

## I6 — Pas de retry/backoff non borné

- PASS: Aucun retry non borné détecté dans audio commands

## I7 — Pas de refactoring gratuit

- PASS: 3 fichiers modifiés, fixes causaux uniquement

## I8 — 1 changement = 1 preuve = 1 rollback

- PASS: 3 fixes, rollback documenté dans 15_ROLLBACK.md

## I9 — Preuve manquante -> BLOCKED

- BLOCKED: cargo test (compilation tres longue, interrompue)
- BLOCKED: pnpm tauri build (Node v18 < v20 requis)
- BLOCKED: runtime audio device test (pas acces device depuis CI)

## I10 — Runtime truth wins over docs

- CONFIRMED: transcribe_audio dans docs mais pas dans generate_handler avant fix
- CONFIRMED: Whisper streaming = STUB

## I11 — Elargissement capabilities avec preuve

- PASS: Aucune capability elargie

## I12 — Token PROD requis

- CONFIRMED: Pas de build PROD execute
