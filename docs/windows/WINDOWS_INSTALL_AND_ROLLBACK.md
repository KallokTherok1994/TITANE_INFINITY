# TITANE_INFINITY — Windows Install, Release, and Rollback

## Authority

This is the canonical Windows MSI install/release/rollback guide. The Windows 11 local dev host setup remains in [`WINDOWS_PRIMARY_DEV_PROD_GUIDE.md`](WINDOWS_PRIMARY_DEV_PROD_GUIDE.md).

## Current Truth

| Surface | Status |
|---|---|
| Windows 11 local DEV_HOST | primary |
| Windows MSI v35.x | build proven, install smoke blocked admin |
| Windows MSI v34.0.12 | historically proven |
| Linux v35.1.9 | proven |

Windows v35.1.9 MSI build and SHA256 are proven. Local install smoke is blocked on this host because the MSI installs for all users and Windows Installer returned `Error 1925` without elevation.

## Build and Verify

```powershell
pnpm run verify:windows:release-readiness -- -Mode PreBuild
pnpm run build:windows:msi
pnpm run verify:windows:msi-artifact
```

`pnpm run release:windows:msi` is the governed wrapper that bumps version before building. Do not use it for a no-bump artifact check.

## Install

```powershell
msiexec /i <msi-path>
```

For v35.1.9 local smoke, non-elevated install returned:

```txt
MSIEXEC_EXIT_CODE=1603
WINDOWS_INSTALL_SMOKE=BLOCKED_ADMIN_REQUIRED
BLOCKER=Error 1925 insufficient privileges for all-users install
```

The smoke validator does not install by default:

```powershell
pnpm run verify:windows:install-smoke
pnpm run verify:windows:install-smoke -- -MsiPath <msi-path> -ExpectedVersion <version> -Install
```

## Uninstall and Rollback

```powershell
msiexec /x <product-code-or-msi-path>
```

Rollback proof requires an uninstall result plus either a successful reinstall of the previous known-good MSI or a documented return to the previous proven channel.

```powershell
pnpm run verify:windows:install-smoke -- -MsiPath <msi-path> -ExpectedVersion <version> -Uninstall
```

## CI Boundary

GitHub Actions Windows can prove MSI artifact quality and checksum quality. It cannot prove local Windows install, Start Menu behavior, Add/Remove Programs state, visible version, app launch, or rollback on the local machine.
