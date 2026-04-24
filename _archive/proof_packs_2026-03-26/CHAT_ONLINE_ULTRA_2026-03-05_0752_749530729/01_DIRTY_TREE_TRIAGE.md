# DIRTY TREE TRIAGE

- generated_at_utc: 2026-03-05T13:10:00Z
- short_sha: `749530729`

## Bootstrap Truth (requested)

### `git status --porcelain=v1`

- ` M docs/tests/UI_COVERAGE_MAP.md`
- ` M e2e/desktop/page-objects/uiPages.po.js`
- ` M e2e/desktop/ui-driver.wdio.js`
- ` M e2e/desktop/ui-ultra-full.e2e.js`
- ` M e2e/desktop/ui-ultra-smoke.e2e.js`
- ` M scripts/autoheal/autoheal_rules.jsonl`
- ` M scripts/e2e/run-desktop-suite.js`
- ` M src/hooks/useAudioSettings.ts`
- `?? docs/MAP_UI_CHAT.md`
- `?? proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729/`
- `?? proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/`
- `?? proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/`
- `?? proof_packs/cross_platform_2026-03-05_0715_749530729/`
- `?? scripts/qa/redact.sh`

### `git diff --name-only`

- `docs/tests/UI_COVERAGE_MAP.md`
- `e2e/desktop/page-objects/uiPages.po.js`
- `e2e/desktop/ui-driver.wdio.js`
- `e2e/desktop/ui-ultra-full.e2e.js`
- `e2e/desktop/ui-ultra-smoke.e2e.js`
- `scripts/autoheal/autoheal_rules.jsonl`
- `scripts/e2e/run-desktop-suite.js`
- `src/hooks/useAudioSettings.ts`

### `git rev-parse --short HEAD`

- `749530729`

## Governed Decision

- Decision: `CAS B`.
- Reason: tracked files are modified outside proof artifacts (`proof_packs/**`, `reports/**`, logs), therefore tree is polluted for strict AutoHeal capture gate.
- Stopline: `BLOCKED_EXISTING_DIRTY_TREE`.
- Consequence: no new ONLINE E2E run should start before tree stabilization.

## Remediation Executed (non-destructive)

- Applied targeted stash:
  - `git stash push -m "pre-chat-online-unblock-20260305T1315Z" -- docs/tests/UI_COVERAGE_MAP.md e2e/desktop/page-objects/uiPages.po.js e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-full.e2e.js e2e/desktop/ui-ultra-smoke.e2e.js scripts/autoheal/autoheal_rules.jsonl scripts/e2e/run-desktop-suite.js src/hooks/useAudioSettings.ts`
- Post-state:
  - `git diff --name-only` => empty
  - `node scripts/qa/check_autofix_autoheal_registry.mjs` => PASS (coverage check skipped, no governed fix files)

## Updated Decision

- Dirty-tree blocker is cleared for tracked files.
- Active blocker is now provider configuration (`BLOCKED_PROVIDER_CONFIG`).

## Next Action <= 30min

1. Stabilize tracked changes out of this campaign.
2. Preferred non-destructive option: `git stash push -m "pre-chat-online-unblock" -- docs/tests/UI_COVERAGE_MAP.md e2e/desktop/page-objects/uiPages.po.js e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-full.e2e.js e2e/desktop/ui-ultra-smoke.e2e.js scripts/autoheal/autoheal_rules.jsonl scripts/e2e/run-desktop-suite.js src/hooks/useAudioSettings.ts`
3. Re-run `node scripts/qa/check_autofix_autoheal_registry.mjs`.
4. Continue health/e2e sequence only after validator no longer blocked by unrelated dirty tree.
