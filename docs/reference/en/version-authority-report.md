# TITANE∞ — Version Authority Report

**Status:** PROVEN  
**Date:** 2026-03-17  
**Mode:** AUDIT

---

## 1. CANONICAL CURRENT VERSION

| Field | Value | Source | Status |
|---|---|---|---|
| Product version | `28.0.0` | `package.json` → `"version": "28.0.0"` | PROVEN |
| Rust crate version | `28.0.0` | `src-tauri/Cargo.toml` → `version = "28.0.0"` | PROVEN |
| CHANGELOG entry | `[28.0.0] - 2026-03-14` | `CHANGELOG.md` | PROVEN |
| README authority claim | `v28.0.0 (repository authority)` | `README.md` | PROVEN |
| Docs hub claim | `28.0.0` | `docs/README.md` | PROVEN |

**Canonical version source:** `package.json` (primary), corroborated by `src-tauri/Cargo.toml` and `CHANGELOG.md`.

---

## 2. VERSION SURFACES AUDIT

### 2.1 Surfaces containing current version (28.0.0)

| File | Version found | Consistent | Status |
|---|---|---|---|
| `package.json` | `28.0.0` | YES | PROVEN |
| `src-tauri/Cargo.toml` | `28.0.0` | YES | PROVEN |
| `CHANGELOG.md` | `[28.0.0]` | YES | PROVEN |
| `README.md` | `v28.0.0` | YES | PROVEN |
| `docs/README.md` | `28.0.0` | YES | PROVEN |
| `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` | `28.0.0` | YES | PROVEN |

### 2.2 Historical version references (NOT contradictions)

| File / Reference | Version | Classification | Action |
|---|---|---|---|
| `docs/user/README.md` | `19.4.3` | LEGACY — old user README | Add legacy banner |
| `docs/INVARIANTS_TITANE.md` | `19.3Ω` | LEGACY — historical invariants doc | Keep, label LEGACY |
| `docs/GETTING_STARTED.md` | `v24.2.0` | LEGACY — older guide | Keep, add banner |
| `deployment/latest/SHA256SUMS_v27.0.5.txt` | `v27.0.5` | LEGACY binary — explicitly documented | KEEP as historical |
| `titane-infinity@16.2.3` (root file) | `16.2.3` | Empty placeholder file | LEGACY marker file |
| `titane-infinity@9.0.0` (root file) | `9.0.0` | Empty placeholder file | LEGACY marker file |
| `docs/ARCHITECTURE.md` | `v8.0` (internal title) | LEGACY sub-version label | DOC_ONLY |

### 2.3 Contradictions

None detected. All `28.0.0` surfaces are coherent.  
Historical references are explicitly labeled as historical in README and CHANGELOG.

---

## 3. CANONICAL VERSION DETERMINATION RULE

```
CANONICAL VERSION = package.json → version field
CORROBORATED BY:
  - src-tauri/Cargo.toml → version field (must match)
  - CHANGELOG.md → latest [X.Y.Z] heading
  - README.md → "Version:" field in header
HISTORICAL VERSIONS:
  - Kept in docs with explicit LEGACY labels
  - Not removed, not presented as current
  - Binary artifacts from v27.0.5 are historical reference, not current release
```

---

## 4. VERSION NORMALIZATION REQUIRED

| File | Action | Priority |
|---|---|---|
| `docs/user/README.md` | Add legacy banner pointing to `docs/user/en/README.md` or `docs/user/fr/README.md` | P2 |
| `docs/GETTING_STARTED.md` | Add legacy banner pointing to new canonical guides | P2 |
| `docs/INVARIANTS_TITANE.md` | Add version note: "document reflects pre-28.x baseline; consult governance docs for current invariants" | P3 |

---

## 5. VERSION RELEASE HISTORY (CANONICAL RECORD)

| Version | Date | Type | Binary Released | Status |
|---|---|---|---|---|
| `28.0.0` | 2026-03-14 | Governance + docs authority | Pending / DOC_ONLY | CURRENT |
| `27.2.0` | 2026-03-07 | TypeScript strict + CI fixes | YES | HISTORICAL |
| `27.0.5` | Pre-2026-03 | Production binary baseline | YES (AppImage/DEB/RPM) | HISTORICAL |
| `27.0.6` | 2026-02-18 | DOCS-ONLY hotfix | NO binary | HISTORICAL |

---

## 6. VERDICT

**VERSION_AUTHORITY:** PROVEN — `package.json` v28.0.0 is the single canonical version source.  
**CONTRADICTIONS:** 0 active contradictions found.  
**HISTORICAL DRIFT:** Documented and controlled — no silent blurring.

---

*Source authority: `package.json`, `src-tauri/Cargo.toml`, `CHANGELOG.md`, `README.md`*  
*Generated: 2026-03-17*
