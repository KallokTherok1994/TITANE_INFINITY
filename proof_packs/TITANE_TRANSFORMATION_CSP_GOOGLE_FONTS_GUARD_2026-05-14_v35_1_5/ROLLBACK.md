# ROLLBACK

```text
git restore -- src/utils/googleFontStylesheetGuard.ts src/main.tsx src/__tests__/utils/googleFontStylesheetGuard.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Expected rollback effect

- Remove the bootstrap Google Fonts guard
- Remove the focused DOM regression test for external stylesheet injection
- Remove the governed mapping and registry entries for this phase