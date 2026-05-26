# Gate Log

## PASS

- `pnpm run check`
- `pnpm run lint`
- `pnpm run format:check`
- `pnpm run test --run`
- `pnpm run test:rust`
- `pnpm run guard:ipc-contract`
- `pnpm run verify:tauri-configs`
- `pnpm run verify:tauri-only`
- `pnpm run verify:online-first`
- `pnpm run verify:network-guard`
- `bash scripts/autoheal/detect_recurrence.sh`
- `pnpm run sync:versions`
- `TAURI_BOOT_TIMEOUT_SECONDS=900 pnpm run dev:tauri -- --smoke 45`
- `pnpm run build:windows:msi`
- `pnpm run verify:windows:msi-artifact`
- Release exe 20s launch smoke

## Blocked

- `pnpm run verify:windows:install-smoke -- -MsiPath src-tauri/target/release/bundle/msi/titane-infinity_35.1.9_x64_en-US.msi -ExpectedVersion 35.1.9 -Install` => `BLOCKED_ADMIN_REQUIRED`

## Partial

- `pnpm run verify:windows:release-readiness -- -Mode PostBuild` => `PARTIAL` because local install smoke requires Administrator elevation.
