# RELEASE v30.1.22 — TITANE∞

**Date:** 2026-04-15  
**Version:** 30.1.22  
**Branch:** MAIN  
**Build type:** BUILD ALL local (Tauri desktop + Android)

---

## Release Scope

### ops(release): BUILD ALL refresh + launcher sync hardening
- Bumped the canonical application version from 30.1.21 to 30.1.22 and synchronized package, Cargo, Tauri, and runtime manifests.
- Built Linux distribution artifacts: AppImage, DEB, RPM.
- Built Android release artifacts: unsigned universal APK and universal AAB.
- Reinstalled the host DEB cleanly to move the system package from 30.1.21 to 30.1.22.
- Hardened the post-build launcher sync so local and system desktop entries are regenerated from the dynamic launcher script instead of copying a stale static desktop file.

---

## Artifacts

| Artifact | Size | SHA256 |
|----------|------|--------|
| `TITANE Infinity_30.1.22_amd64.AppImage` | 89 MB | `5993ee382d3a0326b9f902b08b5b36dbf53ec053cb5b095c86fcee9306ad3a4c` |
| `TITANE Infinity_30.1.22_amd64.deb` | 20 MB | `d1c074bfa70d369176e83a4e2e9aad5ba750f402489100d8ed4f61a0dc1def34` |
| `TITANE Infinity-30.1.22-1.x86_64.rpm` | 20 MB | `469d1b3fdfd9c46487d25f61b392f6bcb70144ba655c2cc3be9f9631419fd1e3` |
| `app-universal-release-unsigned.apk` | 67 MB | `ecae4c5bf2bed392157570817f31c2e097134e870f0a08b194e5aeaab242b637` |
| `app-universal-release.aab` | 42 MB | `3a4ae8f07ea35d74e099c98c80c3b5cb8aa3fb737a9b0ceffcb3c3ff8774c449` |

---

## Gates

| Gate | Status |
|------|--------|
| `pnpm run tauri build` | PASS |
| `pnpm run android:build:full` | PASS |
| `dpkg` reinstall `titane-infinity` 30.1.22 | PASS |
| Desktop launcher sync test | PASS |
| Launcher local/system version alignment | PASS |
| Windows MSI local build | N/A on Linux host |

---

## Rollback

1. Reinstall the prior DEB if needed.
2. Restore release surfaces and launcher scripts from Git.
3. Re-run `bash scripts/post-build/update-desktop-icons.sh` to realign desktop entries after rollback.