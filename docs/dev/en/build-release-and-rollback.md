# TITANE∞ — Build, Release and Rollback (EN)

**Version:** 28.0.0  
**Status:** PARTIAL  
**Date:** 2026-03-17

---

## Frontend build

```bash
# Standard build
pnpm run build

# Output: dist/ (required by Tauri)
```

> **CI note:** The Tauri CI (`rust.yml`) requires a `dist/` placeholder before the cargo build:
> ```bash
> mkdir -p dist && echo "CI placeholder" > dist/index.html
> ```
> Source: `scripts/autoheal/autoheal_rules.jsonl` AH-2026-03-07-0092 (PROVEN)

---

## Tauri build (binary)

```bash
# Full production Tauri build
pnpm run build:production

# Order: lint → format:check → ollama:bundle → vite build → tauri build
```

> **Linux prerequisite:** Tauri system dependencies must be installed.
> See: [Environment Setup](./environment-setup.md)

---

## Published releases

| Version | Type | Artifacts | Status |
|---|---|---|---|
| v27.0.5 | Production binary | AppImage, DEB, RPM | PROVEN — available on GitHub Releases |
| v28.0.0 | Governance + docs | No public binary | PARTIAL |

**v27.0.5 downloads:**
```bash
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v27.0.5/TITANE-Infinity_27.0.5_amd64.deb
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
| Mermaid verify | `.github/workflows/mermaid-verify.yml` | push | PROVEN |

**Note:** CI workflows require repository owner approval for external PRs.

---

*French documentation: [docs/dev/fr/build-release-et-rollback.md](../fr/build-release-et-rollback.md)*
