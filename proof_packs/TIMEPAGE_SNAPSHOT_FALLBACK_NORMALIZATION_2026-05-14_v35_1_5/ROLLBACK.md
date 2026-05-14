# ROLLBACK

```text
git restore -- src/pages/TimePage.tsx src/__tests__/pages/TimePage.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Expected rollback effect

- Remove snapshot response normalization from `TimePage`
- Remove the targeted Vitest regression
- Remove governance entries for this phase