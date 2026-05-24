# TITANE_INFINITY — Windows Script Compatibility

## Authority

Windows 11 local DEV_HOST is primary. PowerShell-native commands are preferred for Windows proof. Linux and Git Bash flows remain supported where explicitly classified.

| Script or command | Classification | Notes |
|---|---|---|
| `pnpm run verify:os-host` | Node cross-platform | Emits `OS_HOST`, `OS_FAMILY`, `OS_VERSION`, `CI`, `SHELL_HINT`. |
| `pnpm run dev:windows` | PowerShell-native | Windows dev wrapper: `sync:versions` then `dev:tauri`. |
| `pnpm run verify:windows:toolchain` | PowerShell-native | Checks Node, pnpm, Rust MSVC, MSVC tools, WebView2, VBSCRIPT. |
| `pnpm run verify:windows:icon` | PowerShell-native | Verifies required ICO layers. |
| `pnpm run verify:windows:msi-artifact` | PowerShell-native | Requires an existing MSI; generates SHA256. |
| `pnpm run verify:windows:install-smoke` | PowerShell-native | Does not install unless `-Install` is passed. |
| `pnpm run verify:windows:release-readiness` | PowerShell-native | Aggregates Windows prebuild or postbuild checks. |
| `scripts/launch/launch-titane.ps1` | PowerShell-native | Supports `dev`, `check`, `verify-windows`, `build-msi`, `release-msi`, `clean`. |
| `pnpm run build:windows:msi` | PowerShell-native | Canonical Windows MSI build path. |
| `pnpm run release:windows:msi` | PowerShell-native | Bumps version, syncs, builds MSI, verifies artifact. |
| `pnpm run build:production` | Linux-only | Linux-shaped production path; not the Windows MSI canonical path. |
| `pnpm run verify:tauri-configs` | Git Bash required | Uses `bash scripts/verify/validate-tauri-configs.sh`. |
| `pnpm run verify:instructions` | Git Bash required | Uses shell validators. |
| `.github/workflows/windows-msi-on-demand.yml` | CI-only | Produces MSI, SHA256, `WINDOWS_MANIFEST.json`, `WINDOWS_RUNNER_MANIFEST.json`; no local install claim. |
| WSL shared-tree execution | WSL required | Use a separate WSL clone; do not share the Windows working tree. |
