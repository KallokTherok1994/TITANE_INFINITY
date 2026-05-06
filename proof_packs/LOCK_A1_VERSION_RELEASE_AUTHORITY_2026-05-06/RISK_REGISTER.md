# RISK_REGISTER — Lock A1

**Lock**: A1  
**Date**: 2026-05-06

## Risks

| risk_id | surface | severity | description | mitigation | owner |
|---------|---------|----------|-------------|------------|-------|
| R1 | v33.0.9 VERSION_BUMPED_NOT_RELEASED | HIGH | Code version 33.0.9 exists with no artifacts/checksums/seal proof. Build required to validate this version. | Note in README. Do NOT ship v33.0.9 as "released". | Build Agent |
| R2 | CHANGELOG.md gap (v33.0.0 → ?) | HIGH | 9+ patches undocumented. Changelog is a release surface that must track all version changes. | Flag for CHANGELOG discipline enforcement. Not fabricated. | Build Author |
| R3 | Eval champion at v28.0.0 | HIGH | Scorecards pinned to 5-version-old champion. Eval authority broken. | Addressed by Lock B0 | QA Agent |
| R4 | deployment/latest/ at 33.0.7 MANIFEST / 33.0.8 VERSION.txt | MEDIUM | Two deployment metadata files are inconsistent with each other AND with code. | Next build+deploy will update these. | Build Agent |
| R5 | README v33.0.0 checksum values (before A1) | LOW | Old checksums in README were from v33.0.0, not matching any recent build. | FIXED in A1 — replaced with v33.0.8 actual checksums. | FIXED |

## A1 Remaining Risks (post-fix)

- R1, R2, R3, R4 remain open (no action taken — deferred appropriately)
- R5 is closed by this lock
- No NEW risks introduced (T0 docs-only changes)
