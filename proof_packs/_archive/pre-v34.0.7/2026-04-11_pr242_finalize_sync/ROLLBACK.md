# ROLLBACK — 2026-04-11 PR #242 Finalize Sync

If the `#242` finalization follow-up must be reverted:

```bash
git restore -- \
  scripts/autoheal/autoheal_rules.jsonl \
  src/__tests__/omega-singularity-unified-sync.test.ts \
  src/__tests__/twins/twins-context-chain.test.ts \
  src/services/ai/providers/__tests__/copilot.test.ts \
  src/services/chat/chatMemorySingleDoor.ts \
  proof_packs/2026-04-11_pr242_finalize_sync/VERDICT.md \
  proof_packs/2026-04-11_pr242_finalize_sync/ROLLBACK.md
```

Then re-run:

```bash
corepack pnpm run verify:final100
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```
