# 03_BINARY_SELECTION_POLICY

Canonical policy implemented in `scripts/e2e/native-binary-policy.cjs`.

Selection precedence:

1. explicit `TAURI_BINARY_PATH` if executable (`EXPLICIT_TAURI_BINARY_PATH`)
2. if `TITANE_NATIVE_BINARY_MODE=debug` or `TAURI_DEV_SERVER_URL` set: `debug > release > appimage`
3. default native certification mode (`release`): `release > debug > appimage`
4. optional `newest` mode: newest mtime among debug/release/appimage

Authoritative freshness basis:

- `dist/index.html`
- newest file in `dist/assets`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `package.json`

Classes emitted:

- `FRESH_CERTIFIED_BINARY`
- `FRESH_DEBUG_BINARY`
- `FRESH_RELEASE_BINARY`
- `STALE_DEBUG_BINARY`
- `STALE_RELEASE_BINARY`
- `NO_VALID_BINARY`
- `BUILD_REQUIRED`
- `WORKSPACE_AHEAD_OF_RUNTIME`

Blocking rule:

- native runner blocks when class is stale/no-valid/workspace-ahead/build-required.
