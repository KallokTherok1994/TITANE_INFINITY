# D3 Rollback Plan

**Lock:** D3 | Twin Consent Ledger  
**Date:** 2026-05-06

## Quick Rollback

```bash
# Revert contract and tests to base (pre-v13-sidecar state)
git restore src/services/twin_consent/TwinConsentLedgerContract.ts
git restore src/services/twin_consent/__tests__/TwinConsentLedgerContract.test.ts

# Set feature flag (already default=false — no action needed)
# VITE_TITANE_D3_TWIN_CONSENT_LEDGER=false
# VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE=false
```

## Full D3 Revert
```bash
git restore \
  src/services/twin_consent/TwinConsentLedgerContract.ts \
  src/services/twin_consent/__tests__/TwinConsentLedgerContract.test.ts \
  docs/registry/TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md \
  docs/registry/TITANE_TEST_REGISTRY.md \
  docs/registry/TITANE_DESKTOP_E2E_REGISTRY.md \
  docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
rm -rf docs/twin/ docs/roadmap/D3_INGRESS_AUDIT.md scripts/verify/verify_twin_consent_ledger.sh
```

## Risk
- **None** — no runtime activation by default. Identity observation emission flag is `false`.
- Twin remains mirror, not authority.
