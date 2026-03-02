# REPRODUCTION PROD

## Canonical commands (from repository)

- build prod canonical (`package.json`):
	- `pnpm run build:production`
	- expands to: `pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh`
- run prod artifact:
	- `runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage`

## Expected behavior

- In ≤20s, app reaches `BOOT:READY` OR explicit non-blocking fallback with visible categorized error.
- Never indefinite loading state.

## Reproduction commands executed

- `RUST_LOG=info RUST_BACKTRACE=1 TAURI_LOG_LEVEL=info timeout 40s runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage`
- `RUST_LOG=info RUST_BACKTRACE=1 TAURI_LOG_LEVEL=info timeout 25s runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage`
- x3 batch logged in `08_RUN_X3.log`.

## Observed behavior

- Backend startup succeeds (`AUTH OS initialized`, `Chat orchestrator initialized`, `Main window shown successfully`).
- UI main page load marker appears (`page_load label=main url=tauri://localhost`).
- Process does not exit by itself during probe window; `timeout` kills process (`exit_code=124`).
- Existing stable artifact does not emit new `BOOT:*` markers (`boot_ready=0`, `fallback=0` in x3 logs).

## Conclusion

- Infinite loading root cause is not provable on the currently shipped artifact with sufficient granularity.
- Required next step: authorized prod build to validate VNEXT instrumentation/fix in real release binary.

