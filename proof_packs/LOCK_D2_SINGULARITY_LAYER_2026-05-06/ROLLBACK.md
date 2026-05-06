# ROLLBACK — Lock D2 Singularity Measured Layer

## Rollback Procedure

### Revert contract sidecar
```bash
git restore src/services/singularity_layer/SingularityMeasuredLayerContract.ts
```
This restores the pre-v13 state (51-test version without sidecar).

### Revert test suite (optional — removes D2-UNIT-01..10)
```bash
git restore src/services/singularity_layer/__tests__/SingularityMeasuredLayerContract.test.ts
```

### Remove new docs (created in this session)
```bash
git rm -r docs/singularity/
git rm docs/roadmap/D2_INGRESS_AUDIT.md
git rm scripts/verify/verify_singularity_measured_layer.sh
```

### Disable emission (already default)
```bash
# No action needed — VITE_TITANE_D2_SINGULARITY_EMISSION_ACTIVE=false by default
```

## Production Impact
None — all D2 v13 sidecar changes are:
- Flag-gated (default=false)
- Pure TypeScript additions (no Rust, no IPC, no UI)
- No runtime behavior change unless both T3 flags are explicitly activated
- Passive mode only — no external emission

## Risk Assessment
**LOW** — PROD SAFE. All new code is additive, flag-gated, and passive-by-default.
