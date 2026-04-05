# ARCHIVE DECISIONS — TITANE∞ v28.5.0 Officialization

Generated: 2026-03-21
Session: REPO_OFFICIALIZATION_28_5_0
Canonical target version: **28.5.0**

---

## Policy

Archive conservatively but decisively.

- Historical docs remain in place with version-specific filenames (already self-identifying).
- No deletion of historical evidence.
- Ambiguous "latest pointer" files updated rather than deleted.
- Rollback: single `git restore` command per touched file.

---

## Actions Taken This Session

### 1. deployment/latest/MANIFEST.json

| Field           | Before                                                     | After                        |
| --------------- | ---------------------------------------------------------- | ---------------------------- |
| Previous role   | Active "latest" deployment pointer                         | Same role, updated to 28.5.0 |
| Why not current | Contained `"version": "28.0.0"` while repo canon is 28.5.0 | Resolved                     |
| Action          | Updated `version` to `28.5.0`; noted artifacts pending     | UPDATED                      |
| Historical data | Preserved as `MANIFEST_v28.0.0.json`                       | Not touched                  |
| Rollback        | `git restore -- deployment/latest/MANIFEST.json`           |                              |

### 2. deployment/latest/SHA256SUMS.txt

| Field           | Before                                                                                                | After                                    |
| --------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Previous role   | Active "latest" checksum pointer                                                                      | Updated to reflect 28.5.0 pending status |
| Why not current | Listed `Titan-Stable_28.0.0_*` artifacts                                                              | Resolved                                 |
| Action          | Updated header; v28.5.0 artifacts noted as pending; v28.0.0 entries preserved as historical reference | UPDATED                                  |
| Historical data | Preserved as `SHA256SUMS_v28.0.0.txt`                                                                 | Not touched                              |
| Rollback        | `git restore -- deployment/latest/SHA256SUMS.txt`                                                     |                                          |

### 3. deployment/latest/CHECKSUMS.sha256

| Field           | Before                                                                                                | After                                    |
| --------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Previous role   | Active "latest" checksum pointer (duplicate of SHA256SUMS.txt)                                        | Updated to reflect 28.5.0 pending status |
| Why not current | Listed `Titan-Stable_28.0.0_*` artifacts                                                              | Resolved                                 |
| Action          | Updated header; v28.5.0 artifacts noted as pending; v28.0.0 entries preserved as historical reference | UPDATED                                  |
| Rollback        | `git restore -- deployment/latest/CHECKSUMS.sha256`                                                   |                                          |

---

## Historical Documents — No Action Required

The following files are self-identifying historical records (version in filename) and require no action:

- `deployment/latest/MANIFEST_v28.0.0.json` — frozen v28.0.0 record
- `deployment/latest/SHA256SUMS_v28.0.0*.txt` — frozen v28.0.0 checksums
- `deployment/latest/SHA256SUMS_v27.*.txt` — frozen v27.x checksums
- `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` — frozen v28.0.0 release note
- `docs/90_release/CHANGELOG_v27.*_*.md` — frozen v27.x entries
- `docs/90_release/DEPLOYMENT_v27.*_*.md` — frozen v27.x deployments
- `docs/90_release/CHANGELOG_V4.md` through `CHANGELOG_V19.md` — frozen historical changelogs

---

## What Was NOT Archived

The following were intentionally left in place as historical context that is unambiguously labeled:

- `deployment/latest/TITANE-Infinity_27.2.0_amd64.*` — labeled by version, not confusing
- `deployment/latest/TITANE-Infinity_28.0.0_amd64.*` — labeled by version, historical artifact
- All certification proof packs under `deployment/latest/certification/` — frozen evidence

---

## Rollback Instructions (Full Session)

```bash
git restore -- \
  deployment/latest/MANIFEST.json \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/CHECKSUMS.sha256 \
  VERSION_AUTHORITY_MAP.md \
  RELEASE_SURFACE_INVENTORY.md \
  ARCHIVE_DECISIONS.md
```

Or by single commit revert:

```bash
git revert HEAD
```

---

## Addendum — 2026-04-05 — v29.0.0 Major Release Archival

### Archival decisions executed

| Surface                                 | Decision                           | Reason                                                   |
| --------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `PROD_GATE_REPORT_PATCH010.md`          | MOVED to `_archive/prod_patch010/` | stale root production note from earlier release lane     |
| `PROD_GO_DECISION_PATCH010.md`          | MOVED to `_archive/prod_patch010/` | stale root production note from earlier release lane     |
| `PROD_DEPLOYMENT_CHECKLIST_PATCH010.md` | MOVED to `_archive/prod_patch010/` | preserve proof while cleaning root surface               |
| `PROD_ROLLBACK_PLAN_v28_PATCH010.md`    | MOVED to `_archive/prod_patch010/` | preserve rollback history without polluting current root |

### Non-destructive policy retained

- Historical versioned artifacts under `deployment/latest/` remain in place.
- Historical release docs under `docs/90_release/` remain in place.
- No historical proof pack or version-labeled artifact was deleted.

### Rollback for this archival step

```bash
git restore --staged _archive/prod_patch010 || true
git restore --source=HEAD -- \
  _archive/prod_patch010/PROD_GATE_REPORT_PATCH010.md \
  _archive/prod_patch010/PROD_GO_DECISION_PATCH010.md \
  _archive/prod_patch010/PROD_DEPLOYMENT_CHECKLIST_PATCH010.md \
  _archive/prod_patch010/PROD_ROLLBACK_PLAN_v28_PATCH010.md
```
