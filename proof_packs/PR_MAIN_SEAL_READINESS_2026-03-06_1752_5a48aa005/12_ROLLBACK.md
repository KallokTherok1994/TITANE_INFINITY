# 12 Rollback

## Micro-phase rollback commands

- Remove readiness pack:
```bash
git restore -- proof_packs/PR_MAIN_SEAL_READINESS_2026-03-06_1752_5a48aa005
```

- Revert local readiness-related edits in baseline-sensitive files if needed:
```bash
git restore -- e2e/desktop/ui-ultra-full.e2e.js scripts/autoheal/autoheal_rules.jsonl
```

- Revert all currently tracked local modifications in this readiness scope:
```bash
git restore -- e2e/desktop/ui-ultra-full.e2e.js scripts/autoheal/autoheal_rules.jsonl titane-infinity.desktop
```
