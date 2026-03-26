# Rollbacks

- generated_at_utc: 2026-03-05T12:42:10Z

## Non-Destructive Rollback Commands

- Revert E2E helper/spec hardening:
  - `git restore -- e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-full.e2e.js e2e/desktop/ui-ultra-smoke.e2e.js`
- Revert proof docs and chat map artifacts:
  - `git restore -- docs/MAP_UI_CHAT.md reports/UI_CHAT_COVERAGE.json`
  - `git restore -- proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/*`
- Revert AutoHeal append entries for this campaign:
  - `git restore -- scripts/autoheal/autoheal_rules.jsonl`

## Safe Cleanup

- Remove generated proof-pack runtime artifacts only:
  - `rm -rf proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/runs/*`
  - `rm -f proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/logs/*`
