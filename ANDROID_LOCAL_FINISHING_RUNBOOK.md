# ANDROID_LOCAL_FINISHING_RUNBOOK

## Scope

- Repo-complete: explicit Android mock/full commands, Android artifact inspection, LAN Ollama env examples, proof pack.
- Local-only: Android SDK/NDK/JDK provisioning, device/emulator access, actual APK generation, adb install, signing, final smoke.

## Prerequisites

- Ubuntu with `node`, `corepack`, `pnpm`, `cargo`, `rustup`
- Java JDK 17+
- Android SDK command-line tools
- Android NDK compatible with Tauri mobile
- Rust Android targets: `aarch64-linux-android`, `armv7-linux-androideabi`, `i686-linux-android`, `x86_64-linux-android`
- USB debugging or emulator access via `adb`

## One-time setup

```bash
corepack enable
corepack pnpm install --frozen-lockfile
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
corepack pnpm run android:init
```

## LAN Ollama setup

```bash
source /home/runner/work/TITANE_INFINITY/TITANE_INFINITY/.env.android.example
# replace __LAN_HOST__ locally before running Android commands
```

- Android uses `OLLAMA_BASE_URL` to reach Ollama on the LAN.
- Do not hardcode LAN IPs in repo files.
- If Ollama is unreachable, TITANE must show an explicit error, not a fake local success.

## Explicit Android commands

```bash
corepack pnpm run android:dev:mock
corepack pnpm run android:dev:full
corepack pnpm run android:build:mock:debug
corepack pnpm run android:build:full:debug
corepack pnpm run android:build:mock
corepack pnpm run android:build:full
corepack pnpm run android:artifact:check
corepack pnpm run android:smoke:prep
```

- `mock` = explicit mock backend path.
- `full` = Rust full backend path using LAN Ollama via env.
- `android:build` and `android:build:debug` are intentionally blocked because they were ambiguous.

## Expected artifact paths

- Primary honest target today: debug APK or unsigned release APK generated locally.
- Inspect actual outputs with:

```bash
corepack pnpm run android:artifact:check
```

- Typical debug path after a universal build:

```text
src-tauri/gen/android/app/build/outputs/apk/universal/debug/*.apk
```

- Typical release path without signing secrets:

```text
src-tauri/gen/android/app/build/outputs/apk/universal/release/*-unsigned.apk
```

- No repo proof currently establishes a published AAB or signed Play artifact.

## Install on device

```bash
adb devices
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/<your-debug-apk>.apk
adb shell am start -n com.titane.infinity/.MainActivity
```

## Smoke checklist

- App launches on device/emulator
- Chat can reach Rust backend through Tauri IPC
- `OLLAMA_BASE_URL` points to the LAN host and the host is reachable from Android
- Provider/status surfaces stay explicit on success and failure
- Storage-backed flows use app-managed paths and do not assume desktop-only locations
- No desktop-only feature path (devops/audio shell/autostart) is required for Android runtime

## Blocker classification

- `LOCAL_ACTIONABLE`: repo scripts/docs/features now separate mock vs full and expose artifact inspection
- `PARTIAL_RUNTIME`: generated Android project exists, but this repo session did not produce a new APK on a device
- `BLOCKED_ENV`: if SDK/NDK/JDK/adb/device/signing are absent locally
- `BLOCKED_SIGNING`: signed release / Play-ready publication remains local-only until keystore + secrets exist

## GitHub truth

- No Android GitHub Actions artifact workflow was added in this session.
- Current workflows do not publish Android APK/AAB artifacts.
- Signed release claims remain out of scope until local signing proof exists.
