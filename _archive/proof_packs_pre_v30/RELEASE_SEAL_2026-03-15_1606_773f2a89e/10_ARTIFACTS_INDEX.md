# 10_ARTIFACTS_INDEX

Generated from Run 3 artifacts (2026-03-15 12:33 EDT)
HEAD: c989ea1c6 / tagged evidence SHA: 773f2a89e

## Linux artifacts

| Artifact | Path | Size | SHA256 |
|----------|------|------|--------|
| ELF binary | src-tauri/target/release/titane-infinity | 34M | e8a8d3f70073c4f8d66d32a224f7a24d0a4106cecfee1423cbdc89eb51ab12b1 |
| .deb | src-tauri/target/release/bundle/deb/TITANE-Infinity_28.0.0_amd64.deb | 18M | 583cd0fc9defffcdbc49dc906894a5d4d522f4d14f955c81d84906be81e53d3d |
| .rpm | src-tauri/target/release/bundle/rpm/TITANE-Infinity-28.0.0-1.x86_64.rpm | 18M | (not checksummed) |
| AppImage | src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.0.0_amd64.AppImage | 88M | ca0eace1f68035f2943f84f2e6795b3e87dba9dd765ea10abc6cac9541f81600 |

## Version coherence
| Source | Version |
|--------|---------|
| package.json | 28.0.0 |
| src-tauri/tauri.conf.json | 28.0.0 |
| src-tauri/Cargo.toml | 28.0.0 |
| Bundle output name | TITANE-Infinity_28.0.0 |
→ ALL ALIGNED ✓

## Notes
- Windows/macOS artifacts: NOT built (Linux-only environment)
- Updater .sig files: ABSENT (no TAURI_SIGNING_PRIVATE_KEY)
- Artifacts are NOT committed to git (binary/bundle size too large, gitignored)
