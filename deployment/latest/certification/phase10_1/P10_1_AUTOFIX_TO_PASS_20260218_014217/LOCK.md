# P10.1 AUTOFIX LOCK

**Phase**: P10.1 AUTOFIX TO PASS
**Sealed**: 2026-02-18T01:53:30Z
**Verdict**: FAIL_E2E

## Stop Conditions

- Git clean outside proof pack
- No dependencies changes, no pnpm-lock drift
- E2E loop capped at 5 attempts
- Stop immediately on scope violation

## Reproduction

```bash
# Integration discovery (single run)
pnpm run test:coverage:integration

# E2E single run (sandbox + artifacts)
TITANE_E2E_ARTIFACTS_DIR=<artifacts_dir> \
HOME=<sandbox>/home XDG_CACHE_HOME=<sandbox>/xdg_cache \
XDG_CONFIG_HOME=<sandbox>/xdg_config XDG_DATA_HOME=<sandbox>/xdg_data \
TMPDIR=<sandbox> node scripts/e2e/run-desktop-suite.js
```

