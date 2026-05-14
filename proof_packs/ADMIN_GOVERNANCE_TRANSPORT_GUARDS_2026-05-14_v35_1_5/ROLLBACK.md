# ROLLBACK

```text
git restore -- src/features/governance-center/services/governanceService.ts src/features/governance-center/services/__tests__/governanceService.transportGuard.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Expected rollback effect

- Restore noisy governance bootstrap reads to their prior `safeInvoke` path
- Remove the governance transport-guard regression test
- Remove governance entries for this phase