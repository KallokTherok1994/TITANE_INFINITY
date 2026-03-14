# Changelog

All notable changes to this project are documented in this file.

## [28.0.0] - 2026-03-14

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
