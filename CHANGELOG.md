# Changelog

All notable changes to this project are documented in this file.

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
