# RELEASE v30.1.8 — TITANE∞

**Date:** 2026-04-13  
**Version:** 30.1.8  
**Branch:** MAIN  
**Build type:** Production (Tauri desktop + Android)

---

## What's New

### feat(ui): Zoom + and Zoom − buttons in TopNav (top-right)
- Added two zoom control buttons (ZoomIn / ZoomOut) with live percentage display in the top-right of the TopNav bar.
- Uses existing `zoomScale` utilities — persisted to localStorage (`titane_zoom_level`).
- Zoom range: 50% – 200%. Buttons disabled at limits.
- Stable `data-testid` selectors: `topnav-zoom-controls`, `topnav-zoom-out`, `topnav-zoom-in`.
- 7/7 unit tests PASS.

---

## Artifacts

| Artifact | Size | SHA256 |
|----------|------|--------|
| `TITANE-Infinity_30.1.8_amd64.deb` | 26.6 MB | `faf8ea7b8e1b359ddc3c30c78caca585bfd7f7897aa346ffcf2ae591ec8a4fd8` |
| `TITANE-Infinity-30.1.8-1.x86_64.rpm` | 26.6 MB | `46dd89f39a7ed2c89d6e8cfae47d9ff60bbdd6b9aafe99f2be9eef7ec8f3d1fc` |
| `TITANE-Infinity_30.1.8_amd64.AppImage` | 99.2 MB | `cc5d6600c5b374c9118ccf4da655b94370662cbbdbc2cf9a4a1043d4dd5bc4b2` |
| `app-universal-release-unsigned.apk` | — | `dbb45dee12df7deee5a7b36a175a68e295b20a2aac188b4f467f0c705f6bdf0c` |
| `app-universal-release.aab` | — | `ba2becbbfabc75c60ceb3523d34804fe38bd0aa7924f1875aa6da224165865af` |

---

## Build Gates

| Gate | Status |
|------|--------|
| `pnpm exec tsc --noEmit` | ✅ PASS |
| `vitest run TopNav.test.tsx` (7/7) | ✅ PASS |
| `detect_recurrence.sh` | ✅ PASS |
| `verify_instructions.sh` (30/30) | ✅ PASS |
| Tauri desktop build | ✅ PASS |
| Android APK/AAB build | ✅ PASS |

---

## Rollback

```bash
git checkout HEAD~1
pnpm tauri build
```
