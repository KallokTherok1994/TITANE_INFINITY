# RELEASE v30.1.31 — TITANE∞

**Date:** 2026-04-16  
**Version:** 30.1.31  
**Branch:** MAIN  
**Build type:** local production desktop build after chat/fullscreen proof pass

---

## Release Scope

### fix(chat): publish desktop build 30.1.31 after fullscreen and desktop proof hardening
- Bumped the canonical repo, Cargo, Tauri, and runtime versions from 30.1.30 to 30.1.31.
- Cleared the release gates on the current MAIN worktree: `verify:final100`, `test:all`, the targeted Playwright Android mobile chat proof, the desktop WDIO critical proof, and the AutoHeal/instructions guards.
- Produced a real production desktop build with Linux `AppImage`, `DEB`, and `RPM` bundles plus the release binary.
- Kept the host-install truth honest: the canonical post-build system sync is still blocked by interactive `sudo`, so `/usr/bin/titane-infinity` and the user/system launchers remain on `30.1.30` even though the 30.1.31 build artifacts are present locally.
- Did not rewrite `deployment/latest` in this phase.

---

## Artifacts

| Artifact | Size | SHA256 |
|----------|------|--------|
| `TITANE Infinity_30.1.31_amd64.AppImage` | `92871160` bytes | `ace698eebb8b359e27fa2d8026023bf7215e34d694523f23da53576a90620145` |
| `TITANE Infinity_30.1.31_amd64.deb` | `20055246` bytes | `e8e08cee9233a0f52adeaba380f18e3d05af598b3bc5b4212eb037b38d479d26` |
| `TITANE Infinity-30.1.31-1.x86_64.rpm` | `20055993` bytes | `04909df258c1380fad190fdeed56c6d774a11914ad2b9c330506cf901c53898c` |
| `titane-infinity` | `45078400` bytes | `e40316585f332503bf77f7992d91b8d1d33127a26a378951ad3cfdc88b03e286` |

---

## Gates

| Gate | Status |
|------|--------|
| `pnpm run verify:final100` | PASS |
| `pnpm run test:all` | PASS |
| `pnpm exec playwright test e2e/android/android-build-ui.browser.spec.ts --project chromium-android-ui --grep "T17 - long mobile history stays compact and the return-to-bottom CTA restores the latest view"` | PASS |
| `pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/ui-connectivity-critical.wdio.test.js` | PASS |
| `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY pnpm run build:production` | PASS |
| `bash scripts/post-build/update-desktop-icons.sh` | BLOCKED_BY_INTERACTIVE_SUDO |
| `/usr/bin/titane-infinity` sync to 30.1.31 | BLOCKED |
| `deployment/latest` publication | NOT_RUN |

---

## Rollback

1. Restore the 30.1.31 version bump surfaces and release docs from Git if this local production build must be withdrawn.
2. Remove `RELEASE_v30.1.31.md` and `RELEASE_ARTIFACTS_CHECKSUMS_30.1.31.txt` if the release evidence should not be retained.
3. If system launcher synchronization is later completed and must be reverted, reinstall the previous host package and rerun the desktop refresh sequence for the selected version.
