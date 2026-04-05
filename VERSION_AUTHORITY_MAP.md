# VERSION AUTHORITY MAP — TITANE∞ v29.0.0

Generated: 2026-04-05
Canonical target version: **29.0.0**

---

## A. PRIMARY_CURRENT_AUTHORITY

| Path                             | Version | Authority level | Status  | Action        |
| -------------------------------- | ------- | --------------- | ------- | ------------- |
| `package.json`                   | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `src-tauri/Cargo.toml`           | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `tauri.base.json`                | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json`      | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `runtime/stable/manifest.json`   | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `CHANGELOG.md` (top)             | 29.0.0  | PRIMARY         | CURRENT | KEEP_AS_CANON |

---

## B. SECONDARY_CURRENT_SURFACE

| Path                              | Version                | Authority level | Status  | Action        |
| --------------------------------- | ---------------------- | --------------- | ------- | ------------- |
| `README.md`                       | 29.0.0                 | SECONDARY       | CURRENT | KEEP_AS_CANON |
| `docs/README.md`                  | 29.0.0                 | SECONDARY       | CURRENT | KEEP_AS_CANON |
| `docs/V29_DOCS_INDEX.md`          | 29.0.0                 | SECONDARY       | CURRENT | KEEP_AS_CANON |
| `deployment/latest/MANIFEST.json` | 29.0.0                 | DEPLOYMENT      | CURRENT | KEEP_AS_CANON |
| `deployment/latest/CHECKSUMS.txt` | 29.0.0 artifact hashes | DEPLOYMENT      | CURRENT | KEEP_AS_PROOF |
| `deployment/latest/SIZES.txt`     | 29.0.0 artifact sizes  | DEPLOYMENT      | CURRENT | KEEP_AS_PROOF |

---

## C. HISTORICAL_AUTHORITY

Historical releases remain frozen and preserved: v28.90.0, v28.88.0, v28.5.0, v28.0.0, and v27.x files under `docs/90_release/`, `deployment/latest/`, and older `RELEASE_*.txt` / checksum files.

---

## D. RELEASE_STREAM_STATUS

| Surface                                                   | Observed                                                          | Impact                                        | Classification |
| --------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- | -------------- |
| Source authorities (`package.json`, Cargo, Tauri configs) | Fully aligned to `29.0.0`                                         | Canonical repo truth is coherent              | PASS           |
| `deployment/latest`                                       | Refreshed to `29.0.0` with deployed AppImage/DEB + hashes + sizes | Release publication proof is current          | PASS           |
| Historical tags above current stream                      | Preserved as historical lineage                                   | No blocker if current release tag is explicit | ACKNOWLEDGED   |

This map now reflects an aligned `29.0.0` release stream across source, deployment, and documentation surfaces.

---

## Summary

- Canonical target version in source authorities: `29.0.0`.
- Repo-facing authority surfaces are aligned.
- Final production seal depends on fresh AppImage/DEB publication and checksum refresh in `deployment/latest`.
