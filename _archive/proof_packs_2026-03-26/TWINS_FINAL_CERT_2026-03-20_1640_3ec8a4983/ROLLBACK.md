# ROLLBACK — Session 4

No production code changed in Session 4.

To rollback G1-G7 tests:
```
git restore -- src/__tests__/twins/twins-context-chain.test.ts
```

To rollback autoheal entries (AH-011, AH-012):
```
# Remove last 2 lines from scripts/autoheal/autoheal_rules.jsonl
head -n -2 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_bak.jsonl && mv /tmp/ah_bak.jsonl scripts/autoheal/autoheal_rules.jsonl
```

Prior sessions rollback:
```
git revert 3ec8a4983  # S3: TwinsPage isAdmin
git revert 9233e5712  # S2: phase+syncScore
git revert 2e7aca8c2  # S1: stale guard
```
