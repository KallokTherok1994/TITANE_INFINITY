# 01_REAL_STATE

- `src-tauri/gen/android/` exists: Android init scaffold is present in repo.
- `package.json` previously exposed ambiguous Android commands (`android:dev`, `android:build`, `android:build:debug`).
- `src-tauri/Cargo.toml` default features still include `mock`; full Android path requires explicit `--no-default-features --features custom-protocol,full`.
- `src-tauri/src/main.rs` still contains many mock-gated stubs, but Android desktop-only guards and LAN Ollama note are present.
- `release-unified.yml` and `ci-unified.yml` do not publish Android APK/AAB artifacts.
- Generated Android Gradle project has no explicit signingConfig; signed release remains local-only.
