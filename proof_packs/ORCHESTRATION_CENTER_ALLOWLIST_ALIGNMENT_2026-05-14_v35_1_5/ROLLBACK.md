# ROLLBACK

```text
git restore -- src/lib/security.ts src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Expected rollback effect

- Remove the orchestration-center allowlist additions
- Remove the allowlist anti-regression assertions for this phase
- Remove governance entries for this phase