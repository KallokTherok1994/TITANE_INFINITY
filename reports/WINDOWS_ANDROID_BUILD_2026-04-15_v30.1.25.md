# WINDOWS + ANDROID BUILD REPORT — TITANE∞ v30.1.25

Date: 2026-04-15
Session: WINDOWS_ANDROID_BUILD_30_1_25
Verdict candidate: BLOCKED

## Scope

- Patch version bump from 30.1.24 to 30.1.25
- Local Android release build on the Linux host
- Qualification of the real Windows build path for the current host

## Executed Commands

1. `node scripts/bump-version.mjs`
2. `node scripts/sync-versions.mjs`
3. `command -v pwsh >/dev/null 2>&1 && echo PWSH=present || echo PWSH=missing`
4. `command -v x86_64-w64-mingw32-gcc >/dev/null 2>&1 && echo MINGW=present || echo MINGW=missing`
5. `command -v cargo-xwin >/dev/null 2>&1 && echo CARGOXWIN=present || echo CARGOXWIN=missing`
6. `corepack pnpm run android:env:check || true`
7. `corepack pnpm run android:build:full`
8. `corepack pnpm run android:artifact:check || true`
9. `find src-tauri/gen/android/app/build/outputs -type f \( -name '*.apk' -o -name '*.aab' \) -print0 | xargs -0 sha256sum`
10. `stat -c '%n %s' src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`

## Proof Summary

- Canonical version surfaces now resolve to `30.1.25`.
- Android environment is build-ready on this host: Java, adb, SDK, NDK, and 4/4 Rust Android targets are present.
- Android release artifacts exist for v30.1.25:
  - `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
  - `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`
- Verified checksums:
  - APK: `4441f6ea337c7477d34f32d15f77e85aee4fcd905500066c9ddaef12aa846cd6`
  - AAB: `cfe4b132610cfab40058318a5255b948503dffd222f4fa4064f6fa7b3fc08bd9`
- Verified sizes:
  - APK: `69936527` bytes
  - AAB: `43510592` bytes
- Windows local build is not honestly claimable on this Linux host:
  - `pwsh` is missing
  - `x86_64-w64-mingw32-gcc` is missing
  - `cargo-xwin` is missing
  - the repository Windows spin-up procedure requires Windows + MSVC + WebView2
- The repository does expose a real Windows MSI path via `.github/workflows/windows-msi-on-demand.yml`, but it builds from pushed GitHub state, not from the unpushed local `30.1.25` worktree.

## Residual Limits

- `android:env:check` reports `connected_devices=0`, so no device install or smoke-run proof is claimed.
- The `tauri android build` terminal remained attached after artifact emission; artifact proof is based on filesystem outputs plus checksum/size validation, not on a clean shell exit.
- No Windows MSI/EXE artifact was produced in this session.
- This report does not claim `deployment/latest` publication for v30.1.25.