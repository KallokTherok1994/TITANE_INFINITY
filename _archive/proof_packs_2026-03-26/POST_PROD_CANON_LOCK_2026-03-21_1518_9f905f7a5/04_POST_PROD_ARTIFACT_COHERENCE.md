# Post-Prod Artifact Coherence

## Release Artifacts
| Artifact | Location | Version | Size | Status |
|----------|----------|---------|------|--------|
| AppImage | src-tauri/target/release/bundle/appimage/ | 28.6.0 | 88M | VERIFIED |
| .deb | src-tauri/target/release/bundle/deb/ | 28.6.0 | 18M | VERIFIED |
| Release binary | src-tauri/target/release/titane-infinity | 28.6.0 | 40M | VERIFIED |

## Checksum Verification
SHA256 of AppImage:
- CHECKSUMS file: 27692dd09bc0024982eb86c6dd2588cd01390a5e0870ac64a401ecdaa0b619c2
- Live sha256sum: 27692dd09bc0024982eb86c6dd2588cd01390a5e0870ac64a401ecdaa0b619c2
- **MATCH** ✅

## Native Freshness
- G_NATIVE_BINARY_FRESHNESS: PASS
- freshnessClass: FRESH_RELEASE_BINARY
- shouldBlock: false
- binary MTIME (10:32) > source MTIMEs

## Desktop Launcher
- titane-infinity.desktop Exec: TITANE-Infinity_28.6.0_amd64.AppImage ✅
- Path: src-tauri/target/release/bundle/appimage/ ✅

## deployment/latest/ Gap
deployment/latest/ has AppImages up to v28.5.0. v28.6.0 is not copied there.
This is NON_BLOCKING — the canonical artifact is in bundle/appimage/ with verified checksum.
Classification: SHOULD_FIX_NEXT_CYCLE (copy v28.6.0 AppImage to deployment/latest/ for consistency).
