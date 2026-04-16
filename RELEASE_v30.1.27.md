# RELEASE v30.1.27 — TITANE∞

**Date:** 2026-04-15  
**Version:** 30.1.27  
**Branch:** MAIN  
**Build type:** Local desktop rebuild after recent UI refresh

---

## Release Scope

### build(ui): refresh local desktop artifacts after conversation UI changes
- Bumped the canonical application version from 30.1.26 to 30.1.27 and synchronized package, Cargo, Tauri, and runtime manifests.
- Rebuilt Linux desktop artifacts after the latest UI deltas already present in the worktree: fullscreen conversation chrome, bounded composer visibility, Android-native send proof path, and TopNav zoom indicator normalization.
- Revalidated the touched UI surfaces with targeted Vitest coverage and the dedicated Playwright Android browser-mobile lane before the rebuild.
- Preserved truthful release scope: this session produced a new local desktop build only; `deployment/latest`, Android release artifacts, and installed Linux launchers were not refreshed to 30.1.27.

---

## Artifacts

| Artifact | Size | SHA256 |
|----------|------|--------|
| `TITANE Infinity_30.1.27_amd64.AppImage` | `92903928` bytes | `0d025afdff213cc27a567598ada72eb716a7cd979d5f3a969d975eee174ae17e` |
| `TITANE Infinity_30.1.27_amd64.deb` | `20091694` bytes | `83f138a8a2477c91120f3c3c97a3d0456739f988a8423c403763d721a1a8b1e6` |
| `TITANE Infinity-30.1.27-1.x86_64.rpm` | `20091246` bytes | `4d8d71059ae2b396aa566f88ee6c9ba7778fc0a40fbdca7eb816e9afbd6ee2a7` |
| `src-tauri/target/release/titane-infinity` | `45109712` bytes | `6a405c49428d735087bb4f4405c6021bc87bd2f2ee216cf25521a0f74d3d5f9a` |

---

## Gates

| Gate | Status |
|------|--------|
| `runTests` on `TopNav.test.tsx`, `ConversationSection.test.ts`, `useConversationEngine.test.ts` | PASS |
| `corepack pnpm exec playwright test e2e/android/android-build-ui.browser.spec.ts --project=chromium-android-ui` | PASS |
| `corepack pnpm exec tauri build --config src-tauri/tauri.conf.json` | PASS |
| `bash scripts/post-build/update-desktop-icons.sh` | BLOCKED_BY_INTERACTIVE_SUDO |
| `sudo update-icon-caches /usr/share/icons/hicolor` | BLOCKED_BY_INTERACTIVE_SUDO |
| `update-desktop-database ~/.local/share/applications` | PASS |
| `xdg-desktop-menu forceupdate` | PASS |
| `deployment/latest` update to 30.1.27 | NOT_RUN |
| Android artifact rebuild to 30.1.27 | NOT_RUN |

---

## Rollback

1. Restore the 30.1.27 version bump surfaces from Git if the rebuild must be abandoned.
2. Remove `RELEASE_v30.1.27.md`, `RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt`, and the local proof files for this refresh if they are not to be kept.
3. If launcher synchronization is later completed and must be reverted, reinstall the prior DEB and rerun the Linux post-build sync sequence for the selected version.