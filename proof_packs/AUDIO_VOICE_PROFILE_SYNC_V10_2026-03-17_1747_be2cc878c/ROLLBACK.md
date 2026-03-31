# ROLLBACK

## Code Rollback

1. git restore -- src-tauri/src/identity/voice_profile.rs
2. git restore -- src/entry.ts
3. git restore -- src/main.tsx
4. git restore -- scripts/autoheal/autoheal_rules.jsonl

## Report Rollback

5. git restore -- reports/audio/TITANE_VOICE_SPEC_V10.json
6. git restore -- reports/audio/TITANE_VOICE_BENCHMARK_V10_2026-03-17.json
7. git restore -- reports/AUDIO_VOICE_PROFILE_SYNC_V10_2026-03-17.md

## Proof Pack Rollback

8. git restore -- proof_packs/AUDIO_VOICE_PROFILE_SYNC_V10_2026-03-17_1747_be2cc878c

## Safety Note

- Reverting src-tauri/src/identity/voice_profile.rs removes V10 voice profile backend changes and restores V9 state.
- Reverting src/entry.ts and src/main.tsx restores the prior frontend boot sequence.
- The AutoHeal rules JSONL revert removes entries added during V9/V10 sessions (up to entry 404).
- Prior runtime binary (src-tauri/target/release/titane-infinity) must be rebuilt after rollback.

## Rebuild After Rollback

```bash
pnpm run build:tauri:e2e
```
