# VERSION AUTHORITY MAP — TITANE∞ v28.88.0

Generated: 2026-04-03
Canonical target version: **28.88.0**

---

## A. PRIMARY_CURRENT_AUTHORITY

| Path                        | Version | Authority level | Status  | Action        |
| --------------------------- | ------- | --------------- | ------- | ------------- |
| `package.json`              | 28.88.0 | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `src-tauri/Cargo.toml`      | 28.88.0 | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `tauri.base.json`           | 28.88.0 | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | 28.88.0 | PRIMARY         | CURRENT | KEEP_AS_CANON |
| `CHANGELOG.md` (top)        | 28.88.0 | PRIMARY         | CURRENT | KEEP_AS_CANON |

---

## B. SECONDARY_CURRENT_SURFACE

| Path                          | Version | Authority level | Status  | Action        |
| ----------------------------- | ------- | --------------- | ------- | ------------- |
| `README.md`                   | 28.88.0 | SECONDARY       | CURRENT | KEEP_AS_CANON |
| `docs/README.md`              | 28.88.0 | SECONDARY       | CURRENT | KEEP_AS_CANON |
| `RELEASE_v28.88.0_SEALED.txt` | 28.88.0 | PROOF           | CURRENT | KEEP_AS_PROOF |

---

## C. HISTORICAL_AUTHORITY

Historical releases (keep frozen): v28.5.0, v28.0.0, v27.x files under `docs/90_release/`, `deployment/latest/`, and older `RELEASE_*.txt`/checksum files. SBOM files referencing 29.0.0 have been archived to `sbom/archive/29.0.0/` as non-canonical; fresh 28.88.0 SBOM regenerated in `sbom/`.

---

## D. AMBIGUOUS_SURFACE

| Surface                       | Observed               | Impact                                                                | Classification |
| ----------------------------- | ---------------------- | --------------------------------------------------------------------- | -------------- |
| Local highest tag             | `v37.1.0`              | Higher than canonical stream `28.88.0`; stream authority not explicit | CONTRADICTION  |
| `deployment/latest/*28.88.0*` | No match found locally | Published-latest surface does not prove current canonical release     | CONTRADICTION  |

This map is therefore a qualified authority surface, not a fully sealed one.

---

## Summary

- Canonical target version in source authorities: 28.88.0.
- Local contradiction remains open: highest visible tag is `v37.1.0` and `deployment/latest` does not expose `28.88.0` artifacts.
- Seal gate cannot be treated as open until stream authority (tag/release/latest) is explicitly reconciled.
