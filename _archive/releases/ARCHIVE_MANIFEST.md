# _archive/releases/ — Archive Manifest

**Created:** 2026-04-03  
**Wave:** V29 Wave 2 — Safe Archive / Root Demotion  
**Session:** V29_WAVE_EXECUTION_2026-04-03_ad0e53d9  

---

## Purpose

This directory contains historical release seals and artifact checksums.  
These files are archived from the repository root as part of Wave 2 root cleanup.  
They remain available for historical reference and audit traceability.

---

## Contents

### Release Seal Files
- `RELEASE_v27.0.3_SEALED.txt` — v27.0.3 sealed release record
- `RELEASE_v28.0.0_SEALED.txt` — v28.0.0 sealed release record
- `RELEASE_v28.5.0_SEALED.txt` — v28.5.0 sealed release record
- `RELEASE_v28.81.0_SEALED.txt` through `RELEASE_v28.88.0_SEALED.txt` — incremental v28.x governance releases
- `TITANE_ARTIFACTS_SHA256_v27.0.2_HOTFIX.txt` — v27.0.2 hotfix artifact checksums

### Artifact Checksums
- `RELEASE_ARTIFACTS_CHECKSUMS.txt` — unversioned/generic checksums reference
- `RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt` — v28.5.0 artifact checksums
- `RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt` through `RELEASE_ARTIFACTS_CHECKSUMS_28.88.0.txt` — v28.x artifact checksums

---

## Origin

All files moved from repository root (/) by Wave 2 cleanup session.  
No content modified during move — git history preserved via `git mv`.

## Current canonical release reference

The current production sealed release is **v28.88.0**.  
Proof: `_archive/releases/RELEASE_v28.88.0_SEALED.txt`

New releases (v29.x) will generate new seal files at root temporarily before archiving.
