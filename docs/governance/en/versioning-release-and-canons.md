# TITANE∞ — Versioning, Release and Canons (EN)

**Version:** 28.0.0  
**Status:** PROVEN  
**Date:** 2026-03-17

> See also: `docs/reference/en/version-authority-report.md`

---

## Canonical version source

| Source | Value | Status |
|---|---|---|
| `package.json` → `version` | `28.0.0` | PRIMARY SOURCE |
| `src-tauri/Cargo.toml` → `version` | `28.0.0` | Must match |
| `CHANGELOG.md` | `[28.0.0]` | Corroborates |
| `README.md` | `v28.0.0` | Canonical surface |

**Rule:** `package.json` is the single version authority.

---

## Versioning policy

- **MAJOR increment** (X.0.0): paradigm change, major refactoring
- **MINOR increment** (X.Y.0): new feature, non-breaking change
- **PATCH increment** (X.Y.Z): bug fix, docs-only update

### Required consistency

On any version increment:
1. `package.json` → `version`
2. `src-tauri/Cargo.toml` → `version`
3. `CHANGELOG.md` → new entry `[X.Y.Z] - YYYY-MM-DD`
4. `README.md` → update Version field

---

## Canonical documents

| Type | Canonical document | Status |
|---|---|---|
| Main README | `README.md` | PROVEN |
| Documentation hub | `docs/README.md` | PROVEN |
| Version authority | `docs/reference/en/version-authority-report.md` | PROVEN |
| History | `CHANGELOG.md` | PROVEN |
| FR Index | `docs/INDEX_FR.md` | PROVEN |
| EN Index | `docs/INDEX_EN.md` | PROVEN |

---

## Release history

| Version | Date | Type | Binary published | Status |
|---|---|---|---|---|
| `28.0.0` | 2026-03-14 | Governance + docs | NO | CURRENT |
| `27.2.0` | 2026-03-07 | TypeScript strict + CI | YES | HISTORICAL |
| `27.0.5` | Pre-2026-03 | Production baseline | YES (AppImage/DEB/RPM) | HISTORICAL |
| `27.0.6` | 2026-02-18 | DOCS-ONLY hotfix | NO | HISTORICAL |

---

## Binary release policy

> **RESTRICTED** — PROD tokens required.

1. All gates must pass (`pnpm run verify:final100`)
2. Version updated in `package.json` and `src-tauri/Cargo.toml`
3. `CHANGELOG.md` updated
4. Release proof pack created
5. Production build authorized on demand (Rule 11)
6. Tauri build launched (or use `BUILD ALL` command, Rule 14)
7. Artifacts verified (checksums)
8. GitHub release created
9. Deploy executed on user request

---

*French documentation: [docs/governance/fr/versioning-release-et-canons.md](../fr/versioning-release-et-canons.md)*
