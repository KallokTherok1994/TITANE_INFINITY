# 07 RELEASE ARTIFACT MAP
## Expected outputs (post-build)
- src-tauri/target/release/titane-infinity (binary)
- src-tauri/target/release/bundle/appimage/titane-infinity_28.5.0_amd64.AppImage
- src-tauri/target/release/bundle/deb/titane-infinity_28.5.0_amd64.deb

## Actual outputs (current)
- dist-28.0.0.tar.gz: STALE (not HEAD )
- target/release/: NOT BUILT for HEAD

## Version coherence
tauri.conf.json version: 28.5.0
CHANGELOG latest: 28.5.0
MISMATCH: tauri.conf.json should be updated to 28.5.0 before release build

## Checksum path
After build: sha256sum src-tauri/target/release/bundle/**/*

## Verification commands
sha256sum -c RELEASE_ARTIFACTS_CHECKSUMS.txt (once generated)
