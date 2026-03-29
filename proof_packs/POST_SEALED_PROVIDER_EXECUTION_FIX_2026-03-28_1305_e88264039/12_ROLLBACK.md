# ROLLBACK

1. PRODUCT
- No product source changes in this cycle.

2. GOVERNANCE
- To revert the spec update:
  - git restore -- docs/governance/PROVIDER_RUNTIME_STABILITY_SPEC.md

3. RUNTIME / TEST ARTIFACTS
- Generated build artifacts can be removed if needed (no source impact).

4. MEMORY UNBLOCK STATE
- Provider execution succeeded in one run, but x3 stability is blocked by session crashes.
- Same canary remains valid and unchanged for next rerun.
