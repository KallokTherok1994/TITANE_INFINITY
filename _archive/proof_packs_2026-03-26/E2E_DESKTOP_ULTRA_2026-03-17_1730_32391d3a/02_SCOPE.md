# 02_SCOPE.md

## Scope Definition
Session: E2E_DESKTOP_ULTRA_2026-03-17_1730_32391d3a
Mission: Transform TITANE∞ test architecture into governed certification system for interface truth.

## Rings Touched
- Ring 4 (UI/Modules): src/ — React + Vite frontend
- Ring 4 (OS/UI): src-tauri/ — Tauri desktop runtime
- Ring 4 (E2E harness): e2e/ — Playwright (browser) + WDIO (desktop)
- Ring 4 (E2E launcher): scripts/e2e/ — tauri-wrapper, run-desktop-suite
- Ring 4 (Evidence): proof_packs/ — this session

## In Scope
- Full UI surface inventory (all 36 real routes)
- Test stack discovery (all commands)
- Target authority map (release binary, appimage, launcher)
- Gap matrix classification
- Desktop E2E truth proof or BLOCKED classification
- Anti-lie gate evaluation
- Bounded fix: audio-tts navigation retry stabilization
- x3 desktop E2E run attempt

## Out of Scope
- New feature development
- Broad refactor of test architecture
- UI/product changes
- Node version upgrade (advisory, not blocking task goal)
- Perceptual/vocal quality evaluation (confirmed BLOCKED in AUDIO_TTS_CONTINUE session)

## Architecture Invariants
- I1: Tauri-only — no internal server = desktop truth
- I2: Browser E2E ≠ desktop certification
- I3: Verdicts are scoped per layer (mock/unit/integration/runtime/desktop)
- I4: No PASS without matching proof level
- I5: No silent fallback
- I6: No broad refactor
- I7: Auto-heal bounded
- I8: Desktop authority must prove artifact + IPC
- I9: Unprovable runtime truth → BLOCKED
- I10: Missing proof file → BLOCKED
