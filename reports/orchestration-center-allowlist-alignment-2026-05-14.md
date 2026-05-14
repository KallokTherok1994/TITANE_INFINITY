# Orchestration Center Allowlist Alignment — 2026-05-14

## Summary

- Surface: `/orchestration-center`
- Symptom: repeated frontend whitelist rejections for runtime commands
- Root cause: `ALLOWED_COMMANDS` was missing commands already consumed by the active Meta Orchestrator surface
- Fix: add the missing commands to `src/lib/security.ts` and lock them in the allowlist regression test

## Files

- `src/lib/security.ts`
- `src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts`
- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `registry/ui-events.jsonl`
- `scripts/autoheal/autoheal_rules.jsonl`

## Proof

### Command

```text
pnpm vitest run src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts
```

### Output

```text
✓  core  src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts (34 tests) 9ms
Test Files  1 passed (1)
Tests  34 passed (34)
```

### Command

```text
pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture orchestration-center' --reporter=line
```

### Output

```text
Running 1 test using 1 worker
  1 passed (10.3s)
```

## Outcome

The active orchestration-center surface no longer fails on frontend allowlist drift for its canonical runtime commands.