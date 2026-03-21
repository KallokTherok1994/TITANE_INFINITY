# VERSION AUTHORITY MAP — TITANE∞ v28.5.0

Generated: 2026-03-21
Session: REPO_OFFICIALIZATION_28_5_0
Canonical target version: **28.5.0**

---

## A. PRIMARY_CURRENT_AUTHORITY

Files that define or publicly assert the current official version.

| Path | Version(s) mentioned | Authority level | Status | Action | Proof |
|---|---|---|---|---|---|
| `package.json` | `28.5.0` | PRIMARY | CURRENT | KEEP_AS_CANON | grep verified |
| `src-tauri/Cargo.toml` | `28.5.0` | PRIMARY | CURRENT | KEEP_AS_CANON | grep verified |
| `src-tauri/tauri.conf.json` | `28.5.0` | PRIMARY | CURRENT | KEEP_AS_CANON | grep verified |
| `CHANGELOG.md` | `28.5.0` (top entry) | PRIMARY | CURRENT | KEEP_AS_CANON | top entry confirmed |
| `docs/90_release/PRODUCTION_RELEASE_v28.5.0.md` | `28.5.0` | PRIMARY | CURRENT | KEEP_AS_CANON | present + aligned |

---

## B. SECONDARY_CURRENT_SURFACE

Files that mention current version and follow primary canon.

| Path | Version(s) mentioned | Authority level | Status | Action | Proof |
|---|---|---|---|---|---|
| `README.md` | `v28.5.0` | SECONDARY | CURRENT | KEEP_AS_CANON | aligned to primary |
| `docs/README.md` | `v28.5.0` | SECONDARY | CURRENT | KEEP_AS_CANON | aligned to primary |
| `deployment/latest/MANIFEST.json` | `28.0.0` → `28.5.0` | SECONDARY | UPDATED | UPDATE_TO_28_5_0 | updated this session |
| `deployment/latest/SHA256SUMS.txt` | `28.0.0` → `28.5.0` pending | SECONDARY | UPDATED | UPDATE_TO_28_5_0 | updated this session |
| `deployment/latest/CHECKSUMS.sha256` | `28.0.0` → `28.5.0` pending | SECONDARY | UPDATED | UPDATE_TO_28_5_0 | updated this session |

---

## C. HISTORICAL_AUTHORITY

Files that are frozen records of older versions. Must stay historical.

| Path | Version(s) mentioned | Authority level | Status | Action |
|---|---|---|---|---|
| `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` | `28.0.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v28.0.0.txt` | `28.0.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v28.0.0_2026-03-20.txt` | `28.0.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `deployment/latest/MANIFEST_v28.0.0.json` | `28.0.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `docs/90_release/CHANGELOG_v27.2.0_ENTRY.md` | `27.2.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `docs/90_release/CHANGELOG_v27.0.1_PRODUCTION.md` | `27.0.1` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md` | `27.2.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `docs/90_release/PRODUCTION_DEPLOYMENT_v27.2.0_SEALED.md` | `27.2.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `docs/90_release/RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md` | `27.2.0` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v27.*.txt` (multiple) | `27.x` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `deployment/latest/MANIFEST_v27.*.json` (multiple) | `27.x` | HISTORICAL | FROZEN | KEEP_AS_HISTORY |
| `CHANGELOG.md` — entries `[28.0.0]` and below | `≤28.0.0` | HISTORICAL (within CHANGELOG) | FROZEN | KEEP_AS_HISTORY |

---

## D. AMBIGUOUS_SURFACE

Files that looked current but were actually stale or historical.

| Path | Version(s) mentioned | Issue | Action |
|---|---|---|---|
| `deployment/latest/MANIFEST.json` | `28.0.0` | Active "latest" pointer still at v28.0.0 while repo canon is 28.5.0 | UPDATED this session → 28.5.0 |
| `deployment/latest/SHA256SUMS.txt` | `28.0.0` | Active "latest" checksum pointer at v28.0.0 | UPDATED this session → 28.5.0 pending note |
| `deployment/latest/CHECKSUMS.sha256` | `28.0.0` | Same as SHA256SUMS.txt | UPDATED this session → 28.5.0 pending note |

---

## E. ARCHIVE_CANDIDATE

Files that should no longer live in an active current-facing area.

None identified as requiring move; historical docs already reside under `docs/90_release/` or `deployment/latest/` with version-specific filenames. Their historical nature is clear from file names.

---

## Summary

- **One current version authority**: `28.5.0` in `package.json`, `Cargo.toml`, `tauri.conf.json`, `CHANGELOG.md` top entry
- **All primary and secondary surfaces aligned** after this session
- **Historical docs preserved in place** with version-specific filenames
- **Deployment latest pointers updated** to reflect 28.5.0 canonical status (artifacts pending build)
