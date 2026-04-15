# RELEASE v30.1.23 — TITANE∞

**Date:** 2026-04-15  
**Version:** 30.1.23  
**Branch:** MAIN  
**Build type:** BUILD ALL local (Tauri desktop + Android)

---

## Release Scope

### ops(release): BUILD ALL refresh 30.1.23 with desktop publication truth
- Bumped the canonical application version from 30.1.22 to 30.1.23 and synchronized package, Cargo, Tauri, and runtime manifests.
- Built Linux distribution artifacts: AppImage, DEB, RPM.
- Built Android release artifacts: unsigned universal APK and universal AAB.
- Realigned `deployment/latest` manifest, checksums, sizes, and binary hash to the desktop 30.1.23 artifacts.
- Regenerated local desktop launchers from the launcher script, while preserving truthful notice that the system package on the host is still 30.1.22.

---

## Artifacts

| Artifact | Size | SHA256 |
|----------|------|--------|
| `TITANE Infinity_30.1.23_amd64.AppImage` | 89 MB | `11db4adbb7dacc5502451a3bfda05abeb364b1848a33e5cfef61d5323d31df06` |
| `TITANE Infinity_30.1.23_amd64.deb` | 20 MB | `04335c44a29718838abba211d50e3664514a6b090928b54b7d02468ffbfba875` |
| `TITANE Infinity-30.1.23-1.x86_64.rpm` | 20 MB | `76498a300170c3ee20ac36ee299efee400a3e05d4fe779bf0f26d8400b73fadf` |
| `app-universal-release-unsigned.apk` | 67 MB | `4441f6ea337c7477d34f32d15f77e85aee4fcd905500066c9ddaef12aa846cd6` |
| `app-universal-release.aab` | 42 MB | `3a4ae8f07ea35d74e099c98c80c3b5cb8aa3fb737a9b0ceffcb3c3ff8774c449` |

---

## Gates

| Gate | Status |
|------|--------|
| `pnpm run tauri build` | PASS |
| `pnpm run android:build:full` | PASS |
| `pnpm run android:artifact:check` | PASS |
| `pnpm run verify:tauri-configs` | PASS |
| `deployment/latest` 30.1.23 manifest/checksum alignment | PASS |
| `sudo dpkg -i TITANE Infinity_30.1.23_amd64.deb` | BLOCKED |
| `bash scripts/post-build/update-desktop-icons.sh` (system scope) | BLOCKED |
| Windows MSI local build | N/A on Linux host |

---

## Rollback

1. Restore release surfaces and version files from Git.
2. Remove the new proof pack/report files for v30.1.23 if rollback is required before commit.
3. If system install is later attempted and must be reverted, reinstall the prior DEB then rerun launcher synchronization.