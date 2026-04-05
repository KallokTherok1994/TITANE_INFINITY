# Current Authority Index

**Date**: 2026-04-05
**Scope**: Version governance, release authority, canonical precedence
**Classification**: Authority reconciliation cycle — current certified runtime surfaces aligned on v29.0.0

## CURRENT AUTHORITY SURFACES

These surfaces are legitimately allowed to speak in present tense about TITANE:

| Surface                     | File Path                              | Present-Tense Claim                              | Proof Basis                                                                                     |
| --------------------------- | -------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| package.json                | package.json                           | Version 29.0.0, current repo authority           | Verified directly from repo state on 2026-04-05                                                 |
| Cargo.toml                  | src-tauri/Cargo.toml                   | Version 29.0.0                                   | Matches `package.json`                                                                          |
| tauri.base.json             | tauri.base.json                        | Version 29.0.0                                   | Matches `package.json`                                                                          |
| tauri.conf.json             | src-tauri/tauri.conf.json              | Version 29.0.0                                   | Matches `package.json`                                                                          |
| deployment manifest         | deployment/latest/MANIFEST.json        | Certified deployment version 29.0.0              | `release_gate_status=PASSED`, certification `TITANE_INFINITY_RELEASE_20260405_121527_CERTIFIED` |
| release checksums           | RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt | Current Linux AppImage/DEB checksums for 29.0.0  | SHA256 list for deployed artifacts                                                              |
| CHANGELOG.md                | CHANGELOG.md                           | Top entry 29.0.0 (2026-04-05)                    | Verified directly from repo state                                                               |
| README.md                   | README.md                              | Latest release stream presented as 29.0.0        | References the 2026-04-05 release/tag and deployment metadata                                   |
| VERSION_AUTHORITY_MAP.md    | VERSION_AUTHORITY_MAP.md               | Current version-governance authority map         | Verified by actual file inspection (2026-04-05)                                                 |
| RELEASE_v28.88.0_SEALED.txt | RELEASE_v28.88.0_SEALED.txt            | Historical SEALED proof for the previous release | PASS verdict, 3399/3399 Vitest, 4463/4463 Cargo (2026-03-22)                                    |

## PROOF BACKED CLAIMS

The following claims are backed by executable proof:

1. **Version 29.0.0** is aligned across `package.json`, `src-tauri/Cargo.toml`, `tauri.base.json`, `src-tauri/tauri.conf.json`, and `CHANGELOG.md`.
2. **The current deployment metadata is certified** via `deployment/latest/MANIFEST.json` (`release_gate_status=PASSED`) and the matching `RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt` artifact list.
3. **Historical SEALED evidence remains preserved** in `RELEASE_v28.88.0_SEALED.txt`; it is prior-cycle proof and does not override the current 29.0.0 authority chain.

## CANONICAL OWNER

**VERSION_AUTHORITY_MAP.md** remains the canonical current authority owner for version governance because:

- It reflects the 2026-04-05 reconciliation state
- It points to real repo and deployment evidence instead of narrative-only claims
- It distinguishes current certified runtime truth from historical SEALED proof
- It does not claim more than the available executable evidence supports
