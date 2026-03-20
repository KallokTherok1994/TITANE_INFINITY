# Changelog

All notable changes to this project are documented in this file.

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
