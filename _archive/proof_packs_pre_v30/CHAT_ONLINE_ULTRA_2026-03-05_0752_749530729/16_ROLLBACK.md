# ROLLBACK

## Non-destructive rollback

- Revert proof pack only:
  - `git restore --staged proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729 || true`
  - `git restore -- proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729`

- Revert redaction helper if needed:
  - `git restore -- scripts/qa/redact.sh`

## Dirty-Tree Stabilization Rollback

- If a temporary stash is used for unblock:
  - `git stash list`
  - current unblock stash: `stash@{0}` message `pre-chat-online-unblock-20260305T1315Z`
  - `git stash pop --index <stash_ref>`

- If targeted restore is used instead of stash:
  - `git restore -- docs/tests/UI_COVERAGE_MAP.md e2e/desktop/page-objects/uiPages.po.js e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-full.e2e.js e2e/desktop/ui-ultra-smoke.e2e.js scripts/autoheal/autoheal_rules.jsonl scripts/e2e/run-desktop-suite.js src/hooks/useAudioSettings.ts`

## Notes

- Do not use destructive git commands.
- Existing unrelated modified files were left untouched.
