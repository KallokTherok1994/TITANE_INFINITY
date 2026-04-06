# Security Scope Fix

## Change

- File modified: `scripts/check_forbidden_files.sh`
- Security rule preserved: forbidden patterns and critical scans remain active.
- Scope corrected: scan limited to release/build surfaces.

## Release Surfaces Scanned

- `runtime/`
- `src/`
- `dist/`
- `build/`
- `src-tauri/target/release/bundle/`
- `deployment/latest/`

## Explicitly Ignored (Non-Release)

- `.venv/`
- `.tools/`
- `proof_packs/`
- `node_modules/`
- `.git/`
- caches/tmp and local dev paths (including `runtime/dev/`)

## Evidence

- Initial failing scope validation: `raw/01_scope_gate_validation.log`
- Fixed scope validation pass: `raw/02_scope_gate_validation.log`
- Fixed scope validation exit: `raw/02_scope_gate_validation.exitcode` (`0`)
