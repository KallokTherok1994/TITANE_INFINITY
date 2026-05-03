# 06_RUNNER_HARDENING_AUDIT

Hardening changes:

- runner now writes deterministic lines:
  - `[NATIVE_BINARY_POLICY] class=...`
  - `[NATIVE_BINARY_POLICY] precedence=...`
  - `[NATIVE_BINARY_POLICY] BLOCKER class=... buildRequired=...`
  - `[NATIVE_BINARY_POLICY] workspaceAheadPaths=[...]`
- explicit non-zero stop code on unsafe freshness (`exit 32`)
- no harness-wide rewrite; only preflight gate and policy harmonization

Proof pointer:

- `reports/e2e-desktop/total-dev-seal/block-check/diagnostics.log`
