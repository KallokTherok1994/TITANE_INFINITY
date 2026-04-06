# 02_RELEASE_SCRIPT_DISCOVERY

## Authoritative release scripts (package.json)

| Script | Command | Notes |
|--------|---------|-------|
| build:production | pnpm lint && pnpm format:check && pnpm ollama:bundle && vite build && tauri build && bash scripts/post-build.sh | Full release path |
| build:tauri:e2e | guard:ollama-proxy && require-e2e-build-authorization.sh && vite build && tauri build | E2E-gated release |
| titane:build | ./titane.sh build | Wrapper |
| run:x3:build | bash scripts/lib/run_x3_profile.sh build | x3 build runner |

## Release command used for this proof
pnpm exec tauri build (minimal, vite build already run separately)

## Artifact output paths (expected)
- src-tauri/target/release/titane-infinity          (ELF binary)
- src-tauri/target/release/bundle/appimage/*.AppImage
- src-tauri/target/release/bundle/deb/*.deb

## Post-build script
scripts/post-build.sh — copies icon, updates symlinks

## Signing mechanism
Release workflow passes:
  TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
These secrets are NOT available in local build → updater signature not generated locally.

## SBOM / Provenance
NONE found in release workflow or scripts.
No cosign, no sigstore, no SLSA provenance step.

## Checksum mechanism
CI Linux: sha256sum deb/*.deb appimage/*.AppImage > SHA256SUMS.txt (in bundle dir)
CI Windows: Get-FileHash *.msi (continue-on-error: true — NON-BLOCKING for Windows)
CI macOS: shasum -a 256 *.dmg > SHA256SUMS.txt (|| true — NON-BLOCKING)
Local: manual sha256sum required post-build
