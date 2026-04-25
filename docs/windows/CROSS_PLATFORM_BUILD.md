# TITANE∞ — Cross-Platform Build Runbook (Linux + Windows)

> Current version: see `package.json` · Tauri 2 · Node 24 · pnpm · Rust stable

This document describes how the TITANE∞ project is built on **Linux** and
**Windows** without either platform corrupting the other's environment.

---

## Architecture summary

| Layer | Linux | Windows |
|-------|-------|---------|
| Tauri bundle targets | `appimage`, `deb` | `msi`, `nsis` |
| Post-install script | `scripts/install/stable-postinst.sh` (deb only) | *(not used)* |
| CI runner | `ubuntu-latest` | `windows-latest` |
| Package manager | pnpm (same) | pnpm (same) |
| Rust toolchain | stable (same) | stable (same) |

---

## Why targets are platform-specific in `tauri.conf.json`

`src-tauri/tauri.conf.json` commits `"targets": ["appimage", "deb"]` because
production Linux deploys require exactly those two formats.

The Windows CI jobs override this via the explicit `--bundles` flag:

```yaml
# release-unified.yml — Windows build
run: pnpm exec tauri build --bundles msi,nsis
```

```yaml
# windows-msi-on-demand.yml
run: pnpm exec tauri build --bundles msi
```

**Rule:** never run `pnpm exec tauri build` on Windows without `--bundles msi`
(or `--bundles msi,nsis`). The committed config targets are Linux-only.

---

## Local builds

### Linux

```bash
# Dev mode
pnpm run dev:tauri

# Production bundle (AppImage + .deb)
pnpm run build:production
# Output: src-tauri/target/release/bundle/{appimage,deb}/
```

### Windows

```powershell
# Dev mode
pnpm run dev:tauri

# Production bundle (MSI + NSIS installer)
pnpm exec tauri build --bundles msi,nsis
# Output: src-tauri\target\release\bundle\{msi,nsis}\
```

> Do **not** run `pnpm exec tauri build` without `--bundles` on Windows — it
> will try to build the Linux targets from `tauri.conf.json` and fail.

---

## CI/CD lanes

| Workflow | Trigger | Runner | Bundle |
|----------|---------|--------|--------|
| `ci-unified.yml` | push / PR | ubuntu + windows | Rust check only (no bundle) |
| `release-unified.yml` `build-linux` | tag / dispatch | ubuntu-latest | appimage, deb |
| `release-unified.yml` `build-windows` | tag / dispatch | windows-latest | msi, nsis |
| `windows-msi-on-demand.yml` | manual dispatch | windows-latest | msi |

The `ci-unified.yml` pipeline performs **cargo check + cargo test** on both
platforms but does **not** produce installers — that happens only in
`release-unified.yml`.

---

## Platform-specific files

These files are Linux-only and are safe to ignore on Windows:

| File | Purpose |
|------|---------|
| `scripts/install/stable-postinst.sh` | deb post-install script (desktop icons, launchers) |
| `scripts/post-build/update-desktop-icons.sh` | Refresh hicolor icon cache after install |
| `src-tauri/tauri.conf.json` → `bundle.linux` section | Linux deb dependencies and postInstallScript |

The `postInstallScript` key lives under `bundle.linux.deb` in Tauri's schema,
so it is **ignored by the Windows bundler** automatically.

---

## `.gitignore` protection

Build artifacts are excluded from version control:

```gitignore
# Cross-platform Tauri bundles
*.AppImage
*.deb
*.rpm
*.msi
*.nsis
*.exe
*.dmg
/src-tauri/target
```

Do **not** commit installer files. If `git status` shows `.msi` or `.exe`
files after a build, run `git checkout -- .` or check that `.gitignore` is
applied correctly.

---

## Rollback

If a Windows build produces unexpected changes in git:

```powershell
# Discard all untracked build artifacts
git clean -fdx src-tauri/target/
git restore .
```

---

## See also

- [`docs/windows/SPINUP_WINDOWS.md`](./SPINUP_WINDOWS.md) — Full Windows
  prerequisite and setup guide
- [`src-tauri/tauri.conf.json`](../../src-tauri/tauri.conf.json) — Bundle
  configuration (Linux targets)
- [`.github/workflows/release-unified.yml`](../../.github/workflows/release-unified.yml)
  — Multi-platform release workflow
