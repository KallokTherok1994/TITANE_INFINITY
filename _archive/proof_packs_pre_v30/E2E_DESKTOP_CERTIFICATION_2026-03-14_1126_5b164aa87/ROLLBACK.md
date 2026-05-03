# ROLLBACK

Use only if this E2E certification lane must be reverted.

## Code Rollback

- `git restore -- scripts/e2e/run-ui-chat-360-autofix.cjs`
- `git restore -- e2e/desktop/ui-chat-360-autofix.wdio.test.cjs`
- `git restore -- scripts/autoheal/autoheal_rules.jsonl`

## Proof Rollback

- `git restore -- proof_packs/E2E_DESKTOP_CERTIFICATION_2026-03-14_1126_5b164aa87`
- `git restore -- registry/proofpack-index.jsonl`

## Safety Note

- Generated logs under `reports/e2e-desktop` and `reports/ui_chat_360_autofix` may remain locally even after Git rollback.