# 03_CI_RELEASE_TRUTH

## CI Workflows inventory
Total .github/workflows/*.yml: ~45 files (11,517 lines)
Key workflows: ci-unified.yml, release-unified.yml, stable-build.yml, p3-stable-build.yml

## ci-unified.yml — Job chain
1. lint-and-typecheck (Node 22, pnpm ESLint+tsc+format) — BLOCKING
2. phase0-gates (needs: lint-and-typecheck) — BLOCKING
3. frontend-tests (needs: lint-and-typecheck) — BLOCKING
4. (coverage threshold: only on push to MAIN)

## release-unified.yml — v26.3.0 pipeline
Trigger: tags (refs/tags/*) OR workflow_dispatch
Jobs:
  - build-linux (ubuntu-22.04, Node 20, Rust 1.83) — no continue-on-error on build
  - build-windows (windows-latest, Node 20, Rust 1.83) — checksum step: continue-on-error: true
  - build-macos (macos-latest, Node 20, Rust 1.83, matrix Intel+M1) — checksum: || true
  - release-notes (needs: [build-linux, build-windows, build-macos]) — final job

## Critical observations
1. RELEASE WORKFLOW HAS NO TEST STEP — tests are NOT required before tauri build in release-unified.yml
2. Only ci-unified.yml runs vitest (decoupled from release workflow)
3. No explicit "ci-must-pass before release" gate linking ci-unified → release-unified
4. Windows checksum: continue-on-error: true → checksum can silently fail on Windows
5. macOS checksum: || true → same issue
6. Linux checksum: sha256sum ... > SHA256SUMS.txt || true → can silently fail

## CI Classification
CI_PARTIAL_NON_BLOCKING:
- Tests decoupled from release workflow (not a hard gate before release build)
- Checksum steps non-blocking on Windows/macOS
- No SBOM, no attestation, no provenance
- CI-unified Node 22 ≠ release Node 20 (minor version drift, not a blocker)
