# Rollback — FINAL_END_TO_END_COGNITIVE_TRACE_SEAL_2026_05_08

## Minimal rollback commands

```bash
git restore -- src/hooks/useConversationEngine.ts
git restore -- e2e/desktop/desktop-expert-cognitive-trace-seal.wdio.test.js
git restore -- UI_SURFACE_MAP.md
git restore -- docs/CARTOGRAPHY_COMPLETE.md
git restore -- docs/92_maintenance/COGNITIVE_AUTHORITY_MAP.md
git restore -- scripts/autoheal/autoheal_rules.jsonl
rm -rf proof_packs/FINAL_END_TO_END_COGNITIVE_TRACE_SEAL_2026_05_08
```

## Notes
- This rollback reverts only the final seal mission footprint.
- It does not alter unrelated pre-existing worktree changes.
