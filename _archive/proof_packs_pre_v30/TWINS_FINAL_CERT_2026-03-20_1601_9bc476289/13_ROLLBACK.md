# 13 — ROLLBACK

To fully revert this session's changes:

```bash
git restore -- src/services/chat/chatMemorySingleDoor.ts
git restore -- scripts/autoheal/autoheal_rules.jsonl
git rm -f src/__tests__/twins/twins-context-chain.test.ts
```

After rollback, the stale-value guard is removed and the raw readJson call is restored.
The 12 TWINS context chain tests are deleted.
The autoheal entry is removed.

Note: rollback restores the STALE_ARTIFACT_RISK defect (TWINS-STALE-001).
