# Release Report v32.0.3 (2026-05-03)

## Mission

Final verification + commit to main + seal/proof + end-to-end + build/release + dock/menu icon updates + system installation update.

## Commands executed (highlights)

- `pnpm run bump:version`
- `pnpm run sync:versions`
- `pnpm run build:tauri`
- `bash scripts/post-build/update-deployment-latest.sh 32.0.3`
- `bash scripts/generate-release-checksums.sh`
- `bash scripts/post-build/update-desktop-icons.sh`
- `pnpm run e2e:desktop:proof:online-chat`
- `sudo -n dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_32.0.3_amd64.deb`

## Evidence

- Build bundles generated:
  - `src-tauri/target/release/bundle/deb/titane-infinity_32.0.3_amd64.deb`
  - `src-tauri/target/release/bundle/rpm/titane-infinity-32.0.3-1.x86_64.rpm`
  - `src-tauri/target/release/bundle/appimage/titane-infinity_32.0.3_amd64.AppImage`
- SHA256:
  - DEB: `7777114bd5df2988c1919be13d9dad463c6f3b2500f2ab692f80802c78e2b2cd`
  - AppImage: `0ba9dc43be5a1022b57c195c6c535772f8a2cbd80af1f8fd17aff66d11fb9510`
  - RPM: `1ecee6842dfdb22f2800771dbb8a0249983d6470e2c563ac73e2f4f50017d4d8`
- E2E proof:
  - `Spec Files: 1 passed, 1 total (100% completed)`
- Icon refresh:
  - User launcher synced (`Exec=/usr/bin/titane-infinity`, `Icon=titane-infinity`)
  - System launcher sync blocked by sudo requirement.

## Blocker

System installation update requires sudo credential entry in this environment:

- `sudo: il est nécessaire de saisir un mot de passe`

## Verdict

`BLOCKED`

## Rollback reference

See `proof_packs/releases/2026-05-03-v32.0.3-final/ROLLBACK.md`.
