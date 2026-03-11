# 02 Distribution Gap Analysis

## Dominant hypothesis checks

- Bundles deb/AppImage absent in latest: CONFIRMED
- `deployment/latest` stale: CONFIRMED
- manifest/checksums mismatch with real files: CONFIRMED
- install from final package not proved: CONFIRMED at start
- launcher target still old binary risk: CONFIRMED before refresh

## Intermediate verdicts

- MISSING_DISTRIBUTION_BUNDLES_CONFIRMED
- LATEST_STALE_CONFIRMED
- MANIFEST_MISMATCH_CONFIRMED
- POST_PACKAGE_INSTALL_NOT_PROVED

## Root cause

- V16 sealed local runtime/binary truth but did not regenerate distribution bundles and did not refresh `deployment/latest` metadata to match real files.

## Fix strategy selected (minimal, bounded)

1. Build canonical bundles with Tauri (`deb`, `appimage`).
2. Replace stale latest artifacts with canonical 27.2.0 artifacts.
3. Regenerate manifest and checksums from real artifact hashes/sizes.
4. Prove post-package runtime on real distributed artifacts.

## Classification at start

- DISTRIBUTION_PENDING_ARTIFACT_REFRESH
