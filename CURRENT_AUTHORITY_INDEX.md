# Current Authority Index

**Date**: 2026-04-03
**Scope**: Version governance, release authority, canonical precedence
**Classification**: Authority-only cycle — no runtime changes

## CURRENT AUTHORITY SURFACES

These surfaces are legitimately allowed to speak in present tense about TITANE:

| Surface                     | File Path                   | Present-Tense Claim                               | Proof Basis                                                                             |
| --------------------------- | --------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| package.json                | package.json                | Version 28.88.0, "Governed release authority"     | Verified by VERSION_AUTHORITY_MAP.md (2026-04-03)                                       |
| Cargo.toml                  | src-tauri/Cargo.toml        | Version 28.88.0                                   | Verified by VERSION_AUTHORITY_MAP.md                                                    |
| tauri.base.json             | tauri.base.json             | Version 28.88.0                                   | Verified by VERSION_AUTHORITY_MAP.md                                                    |
| tauri.conf.json             | src-tauri/tauri.conf.json   | Version 28.88.0                                   | Verified by VERSION_AUTHORITY_MAP.md                                                    |
| CHANGELOG.md                | CHANGELOG.md                | Top entry 28.88.0 (2026-03-22)                    | Verified by VERSION_AUTHORITY_MAP.md                                                    |
| README.md                   | README.md                   | Version 28.88.0, "Production (v28.88.0 — SEALED)" | Backed by RELEASE_v28.88.0_SEALED.txt (PASS verdict, 3399/3399 vitest, 4463/4463 cargo) |
| VERSION_AUTHORITY_MAP.md    | VERSION_AUTHORITY_MAP.md    | Self-declared version governance authority        | Verified by actual file inspection (2026-04-03)                                         |
| RELEASE_v28.88.0_SEALED.txt | RELEASE_v28.88.0_SEALED.txt | SEALED release evidence                           | Contains PASS verdict, test results, date 2026-03-22                                    |

## PROOF BACKED CLAIMS

The following claims are backed by executable proof:

1. **Version 28.88.0**: Verified across 5 primary surfaces by VERSION_AUTHORITY_MAP.md
2. **SEALED status**: Backed by RELEASE_v28.88.0_SEALED.txt with PASS verdict and test results
3. **Canonical precedence**: package.json > Cargo.toml > CHANGELOG.md (established by LOCAL_VERSION_STREAM_AUTHORITY_DECISION.md)

## CANONICAL OWNER

**VERSION_AUTHORITY_MAP.md** is the canonical current authority owner for version governance because:

- Most recent verification (2026-04-03)
- Honest about contradictions
- Backed by actual file inspection
- Doesn't make claims beyond what it can prove
