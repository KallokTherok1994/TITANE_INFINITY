# RELEASE v30.1.28 — TITANE∞

**Date:** 2026-04-15  
**Version:** 30.1.28  
**Branch:** MAIN  
**Build type:** BUILD ALL local (Tauri desktop + Android)

---

## Release Scope

### ops(release): BUILD ALL refresh 30.1.28 with desktop publication truth and fresh Android artifacts
- Verified the canonical application version at 30.1.28 across package, Cargo, Tauri, and runtime manifests.
- Built Linux distribution artifacts: AppImage, DEB, RPM, plus the release binary.
- Completed the Android full build and regenerated the unsigned universal release APK plus the universal release AAB.
- Realigned `deployment/latest` manifest, checksums, sizes, and binary hash to the desktop 30.1.28 artifacts.
- Regenerated local desktop launchers from the launcher script, while preserving truthful notice that the installed system binary remains 30.1.26.

---

## Artifacts

| Artifact | Size | SHA256 |
|----------|------|--------|
| `TITANE Infinity_30.1.28_amd64.AppImage` | 89 MB | `58567aca0006222dbd039cc35d6c01d7b104f4dd6c541ed6c1eb16a62a7a240b` |
| `TITANE Infinity_30.1.28_amd64.deb` | 20 MB | `3fd0202ff0a509ef4ee48e6cf566648556a4997cbc5ef99b067afdd372c3cf9b` |
| `TITANE Infinity-30.1.28-1.x86_64.rpm` | 20 MB | `c5c5ba2268c076558f4611d4e69b4c491215d36cc3e09e262fa806c79195f017` |
| `app-universal-release-unsigned.apk` | 67 MB | `f38932fe6b5dc3f46cba9f6e593726f7cd09f83d5bee18c9dd8078d5c5f43b3b` |
| `app-universal-release.aab` | 42 MB | `f0f52996b39beca1184163c15880e1578595d037d04abc38157cb3564b357aff` |

---

## Gates

| Gate | Status |
|------|--------|
| `corepack pnpm exec tauri build --config src-tauri/tauri.conf.json` | PASS |
| `corepack pnpm run android:build:full` | PASS |
| `corepack pnpm run android:artifact:check` | PASS |
| `corepack pnpm run verify:tauri-configs` | PASS |
| `corepack pnpm run android:env:check` | PASS |
| `corepack pnpm exec vitest run src/__tests__/config/desktopLauncherScripts.test.ts` | PASS |
| `deployment/latest` 30.1.28 manifest/checksum alignment | PASS |
| `sudo dpkg -i TITANE Infinity_30.1.28_amd64.deb` | BLOCKED |
| `bash scripts/post-build/update-desktop-icons.sh` (system scope) | BLOCKED |
| Windows MSI local build | BLOCKED on Linux host |

---

## Rollback

1. Restore release surfaces and version files from Git.
2. Remove the new proof pack/report files for v30.1.28 if rollback is required before commit.
3. If system install is later attempted and must be reverted, reinstall the prior DEB then rerun launcher synchronization.