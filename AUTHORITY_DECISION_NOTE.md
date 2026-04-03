# Authority Decision Note

**Date**: 2026-04-03
**Lock**: L1: CURRENT_AUTHORITY_DRIFT
**Verdict**: CURRENT_AUTHORITY_SPLIT_DONE

## Current Authority

The canonical current authority for TITANE version governance is **VERSION_AUTHORITY_MAP.md**.

It governs:
- Version number (28.88.0) across all primary surfaces
- Canonical precedence: package.json > Cargo.toml > CHANGELOG.md
- Release sealing status

All primary surfaces (package.json, Cargo.toml, tauri.base.json, tauri.conf.json, CHANGELOG.md) are verified at 28.88.0.

## Historical Authority

The following surfaces describe previous states and must NOT be treated as current authority:
- All SEALED release files before v28.88.0 (v28.87.0, v28.86.0, ..., v28.0.0, v27.x)
- CHANGELOG.md entries below the top entry
- _archive/ directories

These are preserved for reference only.

## Drift Identified

**Single drift point**: `reports/LOCAL_VERSION_STREAM_AUTHORITY_DECISION.md`
- Claims sealed release evidence (item 4 in canonical precedence) is missing
- Actually, `RELEASE_v28.88.0_SEALED.txt` exists with PASS verdict
- **Severity**: Low (governance doc, not user-facing)
- **Action**: Patch to note file exists

## What May Still Speak in Present Tense

- package.json (version, governed release authority)
- Cargo.toml (version)
- tauri.base.json (version)
- tauri.conf.json (version, stable release description)
- CHANGELOG.md (top entry)
- README.md (production SEALED status — backed by evidence)
- VERSION_AUTHORITY_MAP.md (governance authority)
- RELEASE_v28.88.0_SEALED.txt (SEALED evidence)

## What Must Be Downgraded

Nothing. The system is NOT currently drifting on version authority. The only issue is a governance document that incorrectly says sealed evidence is missing.

## Safe Authority-Only Patch

Update `reports/LOCAL_VERSION_STREAM_AUTHORITY_DECISION.md` to note that `RELEASE_v28.88.0_SEALED.txt` exists, resolving the contradiction in Section D.

This patch:
- Is authority-only (documentation/metadata)
- Does NOT change runtime behavior
- Does NOT mask runtime uncertainty
- Reduces governance drift
- Has clean rollback

## Next Lock

After this cycle: **CHAT_CANONICAL_AUTHORITY**
- Verify the chat kernel is still the single authority after recent PROVIDER_TRUTH_CHAIN changes
- Confirm canonicalDiscernmentKernel remains sole authority for provider, profile, mode, memory injection
