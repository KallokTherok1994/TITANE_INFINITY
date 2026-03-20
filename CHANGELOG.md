# Changelog

All notable changes to this project are documented in this file.

## [28.5.0] - 2026-03-20 (Release Preparation)

### Version Authority

- Bumped canonical repository version from `28.0.0` to `28.5.0`.
- Updated version-bearing runtime files:
  - `package.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`

### Documentation Alignment

- Updated canonical surfaces to reflect the new release target `v28.5.0`:
  - `README.md`
  - `docs/README.md`
- Added canonical release note document for `v28.5.0`.

### Release Target

- Target tag: `v28.5.0`
- Target artifacts:
  - `TITANE-Infinity_28.5.0_amd64.AppImage`
  - `TITANE-Infinity_28.5.0_amd64.deb`
  - `Titan-Stable_28.5.0_amd64.AppImage`
  - `Titan-Stable_28.5.0_amd64.deb`

---

## [28.0.0] - 2026-03-20 (Final Seal Completion)

### Release Finalization

- Finalized canonical release seal for `v28.0.0` with updated tag alignment and GitHub Release notes.
- Added missing release asset `Titan-Stable_28.0.0_amd64.AppImage` to the published release.
- Archived final smoke proofs in `proof_packs/patch-010/`:
  - `smoke_60s_prod_binary.txt`
  - `smoke_180s_prod_binary.txt`
- Archived governance proof and E2E specs for PATCH-010:
  - `proof_packs/governance/PATCH-010_validation_20260320_181019.md`
  - `e2e/PATCH-010-e2e-final.spec.ts`
  - `e2e/PATCH-010-policy-gate.spec.ts`

### Governance

- `verify-prod-deployment.sh`: PASS 8/8
- `verify_instructions.sh`: PASS 20/20
- `detect_recurrence.sh`: PASS (entries=477)
- AutoHeal release-governance capture: `AH-2026-03-20-0115`

### Desktop Runtime

- Updated desktop launcher target to stable runtime path in `titane-infinity.desktop`:
  - `runtime/stable/Titan-Stable_28.0.0_amd64.AppImage`

---

## [28.0.0] - 2026-03-20 (Post-Deploy Certification)

### Certification & Smoke Tests

- **AppImage smoke (180s + 90s)**: BOOT:READY, zero error markers — PASS ×2
- **Installed smoke (/usr/bin/titane-infinity, 180s ×2)**: BOOT:READY, zero error markers — PASS ×2
- **Governance gates**: verify_instructions.sh PASS=20/20, detect_recurrence.sh PASS (472 entries)
- **Secrets engine**: Diagnosed `aead::Error` (passphrase mismatch) → store reset, re-validated error-free

### Artifacts (Final Certified — commit 9f97d77da)

| Package | Size | SHA256 |
| ----------------------------------- | ---- | ---------------------------------------------------------------- |
| Titan-Stable_28.0.0_amd64.AppImage | 86M  | 90442771be7cb2e40972790fa0a1c1eb7ef7ed08d61ad697a0934a1ea5bf1c1b |
| Titan-Stable_28.0.0_amd64.deb      | 15M  | 69f253ef94a3845d7255dc25e72aef36a37527221ca26b2ed8620750d003de71 |
| titane-infinity (binary)           | 40M  | fc57a8f1d0316f587c952cb01c6530fd126bfa019543dcb1416853e452f350a9 |

### Feature Work (post-tag v28.0.0)

- **Provider truth (LOCK1-5)**: Display real provider in UI, unify conversation ID key, backend health polling from truth, backend/chat-mode persistence sync, LOCK1-REPAIR chain wiring
- **Twins (Session 4)**: unlock desktop proof, G7 prompt-trace tests, admin tab re-enabled (recalculateFusion + transitionPhase), chat context injection (currentPhase + syncScore), stale-value guard
- **ZERO_REGRESSION governance**: bootstrap infrastructure, scorecards, CI challenger eval gate (PROMOTION_BLOCKED enforcement), G4 evidence pack, all gates PASS
- **Audio**: corrected Tauri v2 detection in `audioService` (`__TAURI_INTERNALS__`)
- **Build**: resolved vendor chunk cycle (Vite), sealed v28.0.0 proof
- **Tests**: stabilized EventStream snapshot (timezone/format baseline), twins context chain coverage

---

## [28.0.0] - 2026-03-20 (Rebuild PROD)

### Build & Deployment

- **PROD BUILD**: Complete rebuild with fresh artifacts (AppImage 90M + DEB 21M, new SHA256)
- **Tokens Verified**: GO_FOR_PROD_BUILD**TITANE_INFINITY + GO_FOR_PROD_DEPLOY**TITANE_INFINITY
- **Pipeline**: lint + format:check + ollama:bundle + vite build + tauri build + post-build
- **Pre-build Gates**: verify_instructions.sh PASS=20 FAIL=0
- **AutoHeal Integration**: Entry AH-2026-03-20-PROD-BUILD-28.0.0 appended (detect_recurrence PASS, entries=444)

### Governance

- **CLINE Recertification**: Surface audit PASS, PostToolUse JSONL defect removed, kernel STABLE verified
- **Proof Pack**: PROD_BUILD_v28.0.0_2026-03-20_9771870e0 created and archived
- **Desktop Integration**: titane-infinity.desktop with XDG hicolor icons registered
- **GitHub Release**: Tag v28.0.0 updated, assets refreshed, release notes with fresh SHA256

### Artifacts

| Package                               | Size | SHA256                                                           |
| ------------------------------------- | ---- | ---------------------------------------------------------------- |
| TITANE-Infinity_28.0.0_amd64.AppImage | 90M  | f55de6796810bb1e818d005a1263a8aed50645286cbd808677765b5035ebca23 |
| TITANE-Infinity_28.0.0_amd64.deb      | 21M  | 902e8bf278bb9dff66a815b3427be034aeb1a1ad258b0150d78750950ea016b7 |

---

## [28.0.0] - 2026-03-14 (Initial Production Release)

### Governance

- Promoted repository version authority to `28.0.0` (`package.json` + `CHANGELOG.md`).
- Sealed B2 docs authority unlock for canonical surfaces and release-coherence checks.

### Documentation

- Normalized canonical authority wording in `README.md` and `docs/README.md`.
- Reworked `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` to remove internal version contradictions.
- Explicitly separated repository authority version (`28.0.0`) from last published stable binary stream (`v27.0.5`).

## [27.2.0] - 2026-03-07

### Governance

- Finalized drift-resolution lane with frozen decisions:
  - `runtime/stable/manifest.json -> KEEP`
  - `titane-infinity.desktop -> KEEP`
- Added post-drift final resume lane with inherited non-drift gate reruns.

### Verification

- Hardened `scripts/verify/pre-deployment-check.sh` gate logic for:
  - safer secret scan matching (non-test source focus)
  - local-first doctrine marker validation from canonical instruction files
  - critical file check accepting `LICENSE` or `LICENSE.md`
- Improved `scripts/tauri/before-dev.sh` to resolve `pnpm` robustly without hardcoded absolute path.
