# ROLLBACK

## Code rollback
- git restore -- playwright.config.ts

## Proof-pack rollback (if required by operator)
- rm -rf proof_packs/E2E_DESKTOP_CHAT_PLAYWRIGHT_ULTRA_2026-03-18_0920_0017c1ad2

## Autoheal rollback note
- If needed: revert the appended JSONL line in scripts/autoheal/autoheal_rules.jsonl via git restore.
