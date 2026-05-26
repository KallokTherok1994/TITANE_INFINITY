# Windows 11 Local Build / Launch / Deploy Proof

Run ID: `20260525-WINDOWS-LOCAL-v35.1.9`
OS_HOST: `WINDOWS_11_LOCAL`
Version: `35.1.9`

## Prebuild Gates

- `pnpm --version` => `10.30.2`
- `bash --version` => available through Git Bash PATH
- `pnpm run verify:os-host` => `WINDOWS_11_LOCAL`
- `pnpm run verify:windows:toolchain` => exit 0, VBSCRIPT note only
- `pnpm run verify:tauri-configs` => Base `35.1.9`, Dev `35.1.9-dev`, Stable `35.1.9`
- `pnpm run check` => PASS
- `pnpm run lint` => PASS
- `pnpm run format:check` => PASS
- `pnpm run test --run` => PASS, 678/678 shards, `all shards passed`
- `pnpm run test:rust` => PASS
- `pnpm run guard:ipc-contract` => PASS, 43/43
- `pnpm run verify:tauri-only` => PASS
- `pnpm run verify:online-first` => PASS
- `pnpm run verify:network-guard` => PASS
- `bash scripts/autoheal/detect_recurrence.sh` => PASS, entries=2144
- `pnpm run verify` => PASS

## Runtime/Release Proof

- `pnpm run sync:versions` => PASS, 0 files updated
- `runtime/dev/tauri.conf.json` => `35.1.9-dev`
- DEV title => `Titan-Dev v35.1.9 [DEV] — TITANE∞ Development`
- `TAURI_BOOT_TIMEOUT_SECONDS=900 pnpm run dev:tauri -- --smoke 45` => PASS
- TAURI_MONITOR summary => `boot_seen=true`, `warn_count=0`, `error_count=0`, `timeout_count=0`, `unknown_count=0`
- `pnpm run build:windows:msi` => PASS
- MSI => `src-tauri/target/release/bundle/msi/titane-infinity_35.1.9_x64_en-US.msi`
- MSI size => `24002560` bytes
- MSI SHA256 => `260eb82d97e822fde7cd45b1254f34bd1e8378c0a6b2a2315c0cd97179a67572`
- `pnpm run verify:windows:msi-artifact` => PASS, `WINDOWS_MSI_V35=PASS`
- Release exe smoke => `src-tauri/target/release/titane-infinity.exe`, ProductVersion `35.1.9`, alive after 20s
- `pnpm run verify:windows:install-smoke -- -MsiPath ... -ExpectedVersion 35.1.9 -Install` => `BLOCKED_ADMIN_REQUIRED`, `ADMIN_SHELL=NO`
- `pnpm run verify:windows:release-readiness -- -Mode PostBuild` => `PARTIAL`, MSI PASS, install smoke blocked admin

## Verdict

`WINDOWS_MSI_BUILD=PASS`
`WINDOWS_RELEASE_EXE_LAUNCH=PASS`
`WINDOWS_INSTALL_SMOKE=BLOCKED_ADMIN_REQUIRED`
`WINDOWS_RELEASE_READINESS_POSTBUILD=PARTIAL`
