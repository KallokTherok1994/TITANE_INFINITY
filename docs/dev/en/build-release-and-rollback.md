# TITANE∞ — Build, Release and Rollback (EN)

**Version:** 35.2.0  
**Status:** CURRENT  
**Date:** 2026-05-25

---

## Frontend build

```bash
# Standard build
pnpm run build

# Output: dist/ (required by Tauri)
```

> **CI note:** The Tauri CI (`rust.yml`) requires a `dist/` placeholder before the cargo build:
> ```bash
> # Linux/CI (bash)
> mkdir -p dist && echo "CI placeholder" > dist/index.html
> # Windows (PowerShell)
> New-Item -ItemType Directory -Force dist | Out-Null; "CI placeholder" | Out-File dist/index.html
> ```
> Source: `scripts/autoheal/autoheal_rules.jsonl` AH-2026-03-07-0092 (PROVEN)

---

## Tauri build (binary)

### Windows (primary — MSI + NSIS)

```powershell
# Build MSI + NSIS installer (canonical Windows command)
pnpm run build:windows:msi
# Artifacts: src-tauri/target/release/bundle/msi/*.msi
#            src-tauri/target/release/bundle/nsis/*.exe (perUser, no admin)

# Via launcher script (with verification):
.\scripts\launch\launch-titane.ps1 -Mode build-msi

# Governed release (bump + build + artifact verification):
.\scripts\launch\launch-titane.ps1 -Mode release-msi
```

> **CI (on-demand):** Trigger `.github/workflows/windows-msi-on-demand.yml` manually.
> Produces MSI + NSIS EXE + SHA256SUMS.txt + WINDOWS_MANIFEST.json as artifact `windows-msi-<run>`.

### Linux (AppImage/DEB)

```bash
# Full production Tauri build (Linux rail)
pnpm run build:production

# Order: lint → format:check → ollama:bundle → vite build → tauri build
```

> **Linux prerequisite:** Tauri system dependencies must be installed.
> See: [Environment Setup](./environment-setup.md)

---

## Published releases

| Version | Type | Artifacts | Status |
|---|---|---|---|
| v35.1.9 | Production binary | AppImage, DEB (Linux) | PROVEN — `deployment/latest/` |
| v35.1.7 | Production binary | AppImage, DEB, RPM (Linux) | PROVEN — checksums verified |
| v34.0.12 | Windows MSI | MSI installer | PROVEN (Windows v34 only) |
| v35.1.x | Windows MSI | MSI installer | UNKNOWN — not yet proven (see Rule 14.4) |

> **Windows MSI status:** MSI v35.x is not yet proven. Generate via `.github/workflows/windows-msi-on-demand.yml` and supply: MSI artifact + SHA256 + smoke-test proof.

**Linux v35.1.9 artifacts (proven):**
```bash
# AppImage sha256: 9c924cca70655654a56afa75aeff2f425e86844c894704aeaf82f84bd9868315
# DEB     sha256: 84f706ca56f0739bca101742e9ebbd634cd6f235e9632f7901b65b88d8b14d17
```

> Legacy downloads (v27.0.5):
```bash
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/Titan-Stable_27.0.5_amd64.AppImage
```

---

## Preparing a release

> Production builds on demand — no token gate required (Rule 11).
> Use `BUILD ALL` command for full automated sequence (Rule 14).

Minimum steps:
1. Verify `pnpm run verify:final100` passes
2. Update version in `package.json` and `src-tauri/Cargo.toml`
3. Update `CHANGELOG.md`
4. Create release proof pack
5. Run build with PROD tokens

---

## Rollback

### Docs rollback

```bash
git restore -- docs/
```

### Specific file rollback

```bash
git restore -- src/services/api/chat.ts
```

### Full commit rollback

```bash
git revert HEAD --no-commit
git commit -m "revert: description"
```

### Quick rollback reference

Each autoheal entry in `scripts/autoheal/autoheal_rules.jsonl` contains a `rollback` field with the exact command.

---

## CI/CD

| Workflow | File | Trigger | Status |
|---|---|---|---|
| Main CI | `.github/workflows/ci.yml` | push/PR | PROVEN |
| Rust CI | `.github/workflows/rust.yml` | push/PR | PROVEN |
| Windows MSI + NSIS | `.github/workflows/windows-msi-on-demand.yml` | manual dispatch | PROVEN |
| Mermaid verify | `.github/workflows/mermaid-verify.yml` | push | PROVEN |

**Note:** CI workflows require repository owner approval for external PRs.

> **Windows MSI on-demand:** Go to GitHub → Actions → "TITANE∞ Windows MSI On-Demand" → Run workflow.
> Optional `release_tag` input uploads artifacts to a GitHub Release automatically.

---

*French documentation: [docs/dev/fr/build-release-et-rollback.md](../fr/build-release-et-rollback.md)*
