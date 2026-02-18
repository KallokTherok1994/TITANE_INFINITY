# P10.2 Build Override Lock

**Sealed**: 2026-02-18T02:33:21+00:00
**Head**: 6f2b58558ee6958c1e1861a2897ab2e530aac32d
**Verdict**: BLOCKED

## Stop Conditions
- No tests executed via approved runner
- runTests tool mismatch

## Reproduction
- Build safe only: NPM_CONFIG_IGNORE_SCRIPTS=1 pnpm run build
