# 04_VALIDATION

## Pre-edit reality checks
- `bash scripts/verify_instructions.sh` → PASS
- `corepack pnpm run check` → FAIL before install (`node_modules` absent in fresh clone)
- `corepack pnpm run lint` → FAIL before install (`node_modules` absent in fresh clone)
- `corepack pnpm run test:rust` → FAIL before system libs (`glib-2.0` missing in sandbox)

## Post-edit bounded checks
- `corepack pnpm install --frozen-lockfile` → PASS
- `corepack pnpm run check` → PASS
- `corepack pnpm run lint` → PASS
- `corepack pnpm run format:check` → PASS after formatting Android helper files
- `node scripts/android/require-explicit-mode.mjs build` → PASS (ambiguous alias blocked intentionally)
- `corepack pnpm run android:artifact:check` → PASS (`init_ready=yes`, `apk_count=0`, `aab_count=0`, no explicit signing config)
- `corepack pnpm run android:smoke:prep` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS (`entries=851`)
- `bash scripts/verify_instructions.sh` → PASS (`PASS=23 FAIL=0`)

## Remaining bounded blockers
- `cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check` → FAIL on pre-existing formatting drift in `src-tauri/src/knowledge_base_default.rs` (unrelated to this Android patch)
- Fresh Android APK/AAB generation remains `BLOCKED_ENV` in this sandbox (no SDK/NDK/JDK/device proof captured here)
