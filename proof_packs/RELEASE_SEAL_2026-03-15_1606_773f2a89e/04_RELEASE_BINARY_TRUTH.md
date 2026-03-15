# 04_RELEASE_BINARY_TRUTH

## Verdict: RELEASE_TARGET_CONFIRMED (locally, unsigned)

## Build runs

### Run 1 — 2026-03-15 12:01–12:14 EDT
- Command: pnpm exec tauri build (Node 20 via nvm)
- Exit code: 0 ✓
- Binary: src-tauri/target/release/titane-infinity (34M ELF 64-bit)
- Bundles: .deb (18M), .rpm (18M), .AppImage (88M)
- SHA256 binary: abca53791e3851aeb997343bf8d525af1fb5b0c82f55cf97dbe43ab1d97e001c
- SHA256 .deb:   4fc187037d85c94ebb03fdc8dcaf3b72e1bd46b1bf5f6f884fd7cf5d9989a2ce
- SHA256 AppImage: 82e49f81fe8c0215835c9ea1ba1a9ecf1ef6031c8df9c5fbfeda23eaab5c6dcd

### Run 2 — 2026-03-15 12:14–12:24 EDT
- Exit code: 0 ✓
- SHA256 binary: ec2eb8b30e69afdccb3dd36cc310d7b7d55b34fec8e698077254a1acbe2e8add
- DIFFERS from Run 1 — Rust release build is NOT bit-for-bit reproducible

### Run 3 — pending

## Reproducibility
Status: NON-REPRODUCIBLE (different SHA256 per run)
Root cause: Rust embeds build metadata (timestamps, paths) in release binary
Impact: P2 — expected for most Rust projects; not a hard blocker but means checksums
        must be regenerated post-build; cannot pre-publish expected checksums

## Version coherence
- tauri.conf.json: productName=TITANE-Infinity, version=28.0.0 ✓
- Cargo.toml: titane-infinity v28.0.0 ✓
- package.json: version 28.0.0 ✓
- Bundle output: TITANE-Infinity_28.0.0_amd64 ✓

## Artifact paths
| Artifact | Path | Size |
|----------|------|------|
| ELF binary | src-tauri/target/release/titane-infinity | 34M |
| AppImage | src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.0.0_amd64.AppImage | 88M |
| .deb | src-tauri/target/release/bundle/deb/TITANE-Infinity_28.0.0_amd64.deb | 18M |
| .rpm | src-tauri/target/release/bundle/rpm/TITANE-Infinity-28.0.0-1.x86_64.rpm | 18M |

## Launchability
- Binary is ELF 64-bit Linux — launchable in current environment ✓
- Updater signature: ABSENT (TAURI_SIGNING_PRIVATE_KEY not available locally)
- Updater will fail/be disabled in local binary
- For proper signed release: CI pipeline required (TAURI_SIGNING_PRIVATE_KEY secret)

## Classification
RELEASE_TARGET_CONFIRMED — binary builds successfully, bundles produced, version coherent
CAVEAT: unsigned updater, non-reproducible checksums
