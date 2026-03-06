# Rollback - MAIN_DEV_ALL_TESTS_X3

Date: 2026-03-06
Policy: non-destructive rollback only.

## Rollback current run code changes

```bash
git restore -- e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-smoke.e2e.js
```

## Rollback AutoHeal registry entries added in this run

```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl
```

## Rollback current proof pack only

```bash
rm -rf proof_packs/MAIN_DEV_ALL_TESTS_2026-03-06_0808_77d1644cd
```

## Full rollback to pre-run tracked state (keep untracked untouched)

```bash
git restore -- e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-smoke.e2e.js scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl
```

## Verification after rollback

```bash
git status --short
```
