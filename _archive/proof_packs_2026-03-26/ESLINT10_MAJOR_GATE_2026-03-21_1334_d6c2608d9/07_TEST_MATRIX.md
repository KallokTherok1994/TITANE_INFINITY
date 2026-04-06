# Test Matrix

## Champion Baseline

### Lint Command

```bash
pnpm exec eslint src --ext .ts,.tsx --max-warnings=999
```

**Output**: (no warnings or errors emitted)
**Exit code**: 0

### TSC Command

```bash
pnpm tsc --noEmit
```

**Output**: (no errors emitted)
**Exit code**: 0

---

## Results

| Test | Command | Exit Code | Result |
|------|---------|-----------|--------|
| Champion lint | `pnpm exec eslint src --ext .ts,.tsx --max-warnings=999` | 0 | **PASS** |
| Champion tsc | `pnpm tsc --noEmit` | 0 | **PASS** |
| Challenger lint | NOT RUN (PEER_BLOCKED) | n/a | **BLOCKED** |
| Challenger tsc | NOT RUN (PEER_BLOCKED) | n/a | **BLOCKED** |

---

## Notes

- Champion lint produces exit 0 with no output = clean run (no warnings, no errors).
- TSC is also clean.
- Challenger tests deliberately not run — installing ESLint 10 would break peer deps and violate the no-install rule.
- No changes made to any package or config.
