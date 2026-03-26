# Post-Prod Canon Truth

| Layer | Value | Status |
|-------|-------|--------|
| package.json version | 28.6.0 | VERIFIED |
| src-tauri/Cargo.toml version | 28.6.0 | VERIFIED |
| src-tauri/tauri.conf.json version | 28.6.0 | VERIFIED |
| root README.md | v28.6.0 | VERIFIED |
| docs/README.md | v28.6.0 (patched this session) | VERIFIED |
| CHANGELOG.md | [28.6.0] entry present | VERIFIED |
| RELEASE_v28.6.0_SEALED.txt | present, tokens confirmed | VERIFIED |
| RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt | SHA256 match for AppImage | VERIFIED |
| AppImage bundle | TITANE-Infinity_28.6.0_amd64.AppImage (88M) | VERIFIED |
| .deb bundle | TITANE-Infinity_28.6.0_amd64.deb (18M) | VERIFIED |
| Release binary | src-tauri/target/release/titane-infinity (40M) | VERIFIED |
| titane-infinity.desktop Exec | TITANE-Infinity_28.6.0_amd64.AppImage | VERIFIED |
| Latest proof pack | PREPROD_LOCAL_FINAL_GATE_2026-03-21_1500_2f9461f90 + OMEGA_RUNTIME_RECERT | VERIFIED |
| deployment/latest/ | Only up to v28.5.0 AppImages | PARTIAL — v28.6.0 AppImage is in bundle/appimage/ (historical copies, non-blocking) |

All critical canon layers: VERIFIED.
deployment/latest/ gap: NON_BLOCKING — deployment/latest/ is a historical staging copy area; canonical v28.6.0 artifact lives in src-tauri/target/release/bundle/appimage/ and is checksummed.
