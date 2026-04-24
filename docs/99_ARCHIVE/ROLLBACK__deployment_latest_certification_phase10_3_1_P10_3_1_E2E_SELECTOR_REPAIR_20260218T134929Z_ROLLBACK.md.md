# Rollback Plan

If selector fix needs to be reverted:

```bash
git revert --no-edit <commit-hash>
```

Changes to revert:
1. ChatBubble.tsx: remove data-testid attribute
2. ai-verification.full.e2e.js: revert to `.chat-bubble-trigger` selectors
3. chat-ar20.wdio.test.js: revert to `.chat-bubble-trigger` selector

Expected result: back to original E2E failure state (pre-patch).

However, reverting is **not recommended** since this fix resolves the issue.
