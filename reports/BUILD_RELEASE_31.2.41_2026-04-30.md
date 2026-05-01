# BUILD RELEASE 31.2.41

- Date: `2026-04-30`
- Scope: bump de version, build Tauri Linux, déploiement `deployment/latest`, inventaire release, preuves et rollback
- Verdict: `PASS_PARTIAL`

## Commands

```bash
pnpm run bump:version
pnpm run sync:versions
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
pnpm run check
pnpm exec vite build
pnpm exec tauri build --config src-tauri/tauri.conf.json
bash scripts/post-build/update-desktop-icons.sh
```

## Outputs

- `Version bump: 31.2.40 -> 31.2.41`
- `detect_recurrence`: `PASS`
- `verify_instructions`: `SUMMARY: PASS=33 FAIL=0`
- `pnpm run check`: `tsc --noEmit` exit `0`
- `vite build`: `built in 20.88s`
- `tauri build`: `Finished release profile in 9m 35s`
- Bundles:
  - `titane-infinity_31.2.41_amd64.deb`
  - `titane-infinity-31.2.41-1.x86_64.rpm`
  - `titane-infinity_31.2.41_amd64.AppImage`
- `update-desktop-icons.sh`: launcher utilisateur PASS, sync système `BLOCKED_SUDO_REQUIRED`, binary sync `/usr/bin/titane-infinity` `BLOCKED_SUDO_REQUIRED`

## Truth split

- Repo truth: `31.2.41`
- Built artifacts truth: `31.2.41`
- `deployment/latest` truth: `31.2.41`
- Installed system binary truth: encore `31.2.40` tant que `sudo` non interactif indisponible

## Deployment latest

- `deployment/latest/titane-infinity_31.2.41_amd64.AppImage`
- `deployment/latest/titane-infinity_31.2.41_amd64.deb`
- `deployment/latest/titane-infinity-31.2.41-1.x86_64.rpm`
- `deployment/latest/titane-infinity`
- `deployment/latest/VERSION.txt` -> `31.2.41`
- `deployment/latest/MANIFEST.json` -> `31.2.41`
- `deployment/latest/SHA256SUMS.txt` regenerated
- `deployment/latest/SIZES.txt` regenerated
