# ROLLBACK

Use only if this session lane must be reverted.

## Code rollback

- `git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js`

## AutoHeal rollback (if policy requires rollback of session entries)

- `git restore -- scripts/autoheal/autoheal_rules.jsonl`

## Proof pack rollback

- `git restore -- proof_packs/preprod_final_2026-03-15_2050_5869384`

## Safety note

- This rollback restores tracked files only. It does not delete external runtime side effects or already-generated local bundles outside git history.
