# Authority Matrix Current

**Date**: 2026-04-05
**Lock**: L1: CURRENT_AUTHORITY_DRIFT

## SURFACE CLASSIFICATION

| Surface                       | File Path                                | Present-Tense Claim                        | Classification           | Proof Basis                                  | Contradiction                    | Severity | Canonical Owner            | Decision    | Next Action                                            |
| ----------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------ | -------------------------------------------- | -------------------------------- | -------- | -------------------------- | ----------- | ------------------------------------------------------ |
| `package.json`                | `package.json`                           | Version 29.0.0                             | `PROOF_BACKED_CURRENT`   | Direct repo inspection                       | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| `Cargo.toml`                  | `src-tauri/Cargo.toml`                   | Version 29.0.0                             | `PROOF_BACKED_CURRENT`   | Matches `package.json`                       | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| Root Tauri base               | `tauri.base.json`                        | Version 29.0.0                             | `PROOF_BACKED_CURRENT`   | Matches `package.json`                       | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| Active Tauri config           | `src-tauri/tauri.conf.json`              | Version 29.0.0                             | `PROOF_BACKED_CURRENT`   | Matches `package.json`                       | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| Legacy Tauri base copy        | `src-tauri/tauri.base.json`              | Legacy fallback now synced to 29.0.0       | `LEGACY_SYNCED_FALLBACK` | Reconciled during this patch                 | Was stale at 26.2.0 before patch | Medium   | Root `tauri.base.json`     | Keep synced | Ensure `scripts/sync-versions.mjs` updates both copies |
| Deployment manifest           | `deployment/latest/MANIFEST.json`        | Certified deployment version 29.0.0        | `PROOF_BACKED_CURRENT`   | `release_gate_status=PASSED`                 | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| Release checksums             | `RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt` | Current AppImage/DEB hashes for 29.0.0     | `PROOF_BACKED_CURRENT`   | Direct file inspection                       | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| `CHANGELOG.md`                | `CHANGELOG.md`                           | Top entry 29.0.0                           | `PROOF_BACKED_CURRENT`   | Direct repo inspection                       | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | None                                                   |
| `README.md`                   | `README.md`                              | Current release stream presented as 29.0.0 | `PROOF_BACKED_CURRENT`   | Release tag + deployment metadata references | None                             | None     | `VERSION_AUTHORITY_MAP.md` | Keep        | Periodic verification only                             |
| `VERSION_AUTHORITY_MAP.md`    | `VERSION_AUTHORITY_MAP.md`               | Version governance authority               | `PROOF_BACKED_CURRENT`   | Actual file inspection                       | None                             | None     | Self                       | Keep        | Canonical owner                                        |
| `RELEASE_v28.88.0_SEALED.txt` | `RELEASE_v28.88.0_SEALED.txt`            | Prior-cycle SEALED evidence                | `HISTORICAL_PROOF`       | PASS verdict inside file                     | None                             | None     | N/A                        | Keep        | Preserve as historical reference                       |

## DRIFT SUMMARY

**Type 1: stale authority layer (resolved)**

- `CURRENT_AUTHORITY_INDEX.md`, `AUTHORITY_VERDICT.md`, and `AUTHORITY_MATRIX_CURRENT.md` were still anchored to 2026-04-03 / 28.88.0.
- The actual runtime + deployment surfaces were already aligned on 29.0.0.
- **Severity**: Medium — authority docs lagged behind certified deployment truth.
- **Action**: Patched and reconciled to the 2026-04-05 current state.

**Type 2: legacy Tauri base copy (resolved)**

- `src-tauri/tauri.base.json` still exposed 26.2.0 strings while root `tauri.base.json` was already 29.0.0.
- **Severity**: Medium — dormant fallback file could mislead audits or future packaging tasks.
- **Action**: Synced the file and extended `scripts/sync-versions.mjs` coverage to prevent recurrence.

## CURRENT STATUS

The current authority chain is now coherent for **29.0.0**:

- `package.json`: 29.0.0 ✅
- `src-tauri/Cargo.toml`: 29.0.0 ✅
- `tauri.base.json`: 29.0.0 ✅
- `src-tauri/tauri.conf.json`: 29.0.0 ✅
- `deployment/latest/MANIFEST.json`: 29.0.0, certified ✅
- `RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt`: current hashes present ✅

Historical SEALED evidence for 28.88.0 remains archived and non-contradictory.
