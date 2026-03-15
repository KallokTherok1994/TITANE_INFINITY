# ROLLBACK

If this stable artifact copy-filter fix must be reverted:

git restore -- runtime/stable/build.sh runtime/stable/manifest.json titane-infinity.desktop

Then rerun the previous stable build flow if the old copy behavior is intentionally required:

TITANE_BUILD_ASSUME_YES=1 bash runtime/stable/build.sh

Note:
- Reverting the build script would re-expose runtime/stable to stale bundle cache artifacts under src-tauri/target/release/bundle/deb.
