# Commands Used

## Discovery
- `rg -n 'build:tauri:e2e|build:production|run:x3:build' package.json`
- `rg -n 'beforeBuildCommand|targets|frontendDist' src-tauri/tauri.conf.json`
- `rg -n 'runtime/stable/build\.sh|pnpm exec tauri build|g6-build-reproducibility' .github/workflows`
- `rg -n 'SOURCE_DATE_EPOCH|CARGO_INCREMENTAL|CARGO_PROFILE_RELEASE|cargo build --manifest-path src-tauri/Cargo.toml --release --locked' scripts/gates/g6-build-reproducibility.sh`
- `rg -n 'incremental|codegen-units|lto' src-tauri/Cargo.toml`

## Root-cause probes
- `readelf -x .note.gnu.build-id deployment/latest/builds/target-run-{1,2,3}/release/titane-infinity`
- `objcopy --remove-section .note.gnu.build-id ...` (hypothesis check)
- `strip --strip-all ...` (normalization check)

## Fix + verification
- Edited: `scripts/gates/g6-build-reproducibility.sh` (`--strip-debug` -> `--strip-all`)
- `bash scripts/gates/g6-build-reproducibility.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
