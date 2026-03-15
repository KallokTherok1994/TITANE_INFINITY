# Stable Runtime Version Alignment - 2026-03-15

Minimal fix applied:
- `runtime/stable/tauri.conf.json` -> `28.0.0`
- `runtime/stable/manifest.json` -> `28.0.0`

Validation:
- `bash scripts/verify/validate-tauri-configs.sh` PASS
- explicit equality check across package/main-tauri/stable-tauri/stable-manifest PASS
- `bash -n runtime/stable/build.sh` PASS
