# 05_CI_GATE_TRUTH

## Verdict: CI_PARTIAL_NON_BLOCKING

### What IS blocking in CI
- ESLint (ci-unified.yml lint-and-typecheck job) — BLOCKING (job fails = workflow fails)
- TypeScript type check (pnpm check) — BLOCKING
- Format check — BLOCKING
- Phase0 gates (registry guards etc.) — BLOCKING
- Vitest frontend tests (frontend-tests job) — BLOCKING within ci-unified.yml

### What is NOT blocking / missing
- **No hard link from ci-unified → release-unified**: a release can be dispatched even if ci-unified fails
- Rust clippy / fmt not present in release-unified.yml (only Rust build)
- Windows/macOS checksum steps: continue-on-error/|| true → silent failures acceptable
- No test gate inside release-unified.yml
- No SBOM/attestation/cosign gate
- cargo test not run in release workflow

### Node/Rust version drift
| Workflow | Node | Rust |
|----------|------|------|
| ci-unified | 22 | stable |
| release-unified | 20 | 1.83 |
| local nvm | 20 | 1.94.0 |
| package.json requirement | >=20 | N/A |

→ All compatible. Not a blocker, but divergence is documented.

### Dangerous continue-on-error paths
1. release-unified.yml line 172: Windows checksum (continue-on-error: true)
   - Risk: MSI ships without checksum; undetected silently
   - Severity: P2 (supply chain partial)

2. Linux/macOS: || true on checksum commands
   - Same risk, different syntax

### Classification
CI_PARTIAL_NON_BLOCKING — release builds can succeed even if tests failed separately
CI_DIVERGENT — no coupling between test CI and release CI pipeline
