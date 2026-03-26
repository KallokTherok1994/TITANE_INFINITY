# 08_GATES_REPORT

Date: 2026-03-15T16:33Z
HEAD: c989ea1c6 (773f2a89e at pack creation)
Branch: MAIN

| Gate | Status | Evidence |
|------|--------|----------|
| G_RELEASE_TARGET_BUILD_X3 | PASS | 3/3 pnpm exec tauri build exits 0 (Runs: 12:14, 12:24, 12:33 EDT) |
| G_RELEASE_ARTIFACT_EXISTS | PASS | titane-infinity (34M), .deb (18M), .AppImage (88M), .rpm (18M) confirmed |
| G_RELEASE_ARTIFACT_LAUNCHABLE | BLOCKED_ENV | Binary is ELF 64-bit; launching requires display+Tauri env; E2E debug binary proven separate |
| G_CI_CRITICAL_CHECKS_BLOCKING | FAIL | Release workflow has no test gate; tests decoupled from release pipeline |
| G_CI_RELEASE_ALIGNMENT | PARTIAL | CI Node 22 vs release Node 20; Rust stable vs 1.83; no test gate in release workflow |
| G_SIGNATURE_OR_EXPLICIT_BLOCK | BLOCKED | TAURI_SIGNING_PRIVATE_KEY not available locally; local builds unsigned; CI path requires secret |
| G_SBOM_OR_EXPLICIT_BLOCK | FAIL | No SBOM anywhere (no cargo-sbom, no syft, no cyclonedx) |
| G_SECRET_HYGIENE_PROD | PARTIAL | Passphrase guard PASS; .env gitignored PASS; updater signing CI-only PARTIAL |
| G_CHECKSUMS_VALID | PARTIAL | Checksums computed (see 09_BUILD_RUNS_X3.log); CI checksums non-blocking (|| true) |
| G_ROLLBACK_READY | PASS | See 12_ROLLBACK.md; rollback SHA documented |

## Gate summary
- PASS: 3 (BUILD_X3, ARTIFACT_EXISTS, ROLLBACK_READY)
- PARTIAL: 3 (CI_ALIGNMENT, SECRET_HYGIENE, CHECKSUMS)
- FAIL: 2 (CI_CRITICAL_BLOCKING, SBOM)
- BLOCKED: 2 (ARTIFACT_LAUNCHABLE, SIGNATURE)

## Verdict implication
SEALED_PRODUCTION_READY requires ALL gates PASS.
Current: 3 FAIL/BLOCKED critical gates → verdict capped at STABLE_RELEASE_SCOPE
