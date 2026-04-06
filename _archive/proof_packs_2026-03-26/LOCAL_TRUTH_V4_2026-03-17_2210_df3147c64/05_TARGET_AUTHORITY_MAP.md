# 05 — TARGET AUTHORITY MAP

| Surface | Authority | Status |
|---------|-----------|--------|
| Autoheal registry truth | scripts/autoheal/autoheal_rules.jsonl | REAL |
| Duplicate detection truth | scripts/autoheal/detect_recurrence.sh | REAL |
| Governance aggregate truth | scripts/verify_instructions.sh | REAL |
| Commit truth | git HEAD `f0fda53d8` | REAL |
| Proof-pack session truth | this proof pack + registry/proofpack-index.jsonl | REAL after addendum |
| IPC closure truth | proof_packs/SEAL_MASTER_2026-03-17/VERDICT.md | REAL |
| Desktop TTS runtime truth | proof_packs/AUDIO_VOICE_PROFILE_SYNC_V10_2026-03-17_1747_be2cc878c/VERDICT.md | REAL |
| Memory runtime-at-rest truth | memory/system_state.json | PARTIAL / STALE |

## Main target
- Restore governance truth for duplicate autoheal ids without touching product code.
