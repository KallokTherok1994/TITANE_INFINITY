# VERDICT

Status: SEALED
Verdict: PASS
Date: 2026-03-14T15:16:51Z
Commit: 48f50b45467bd955cd19460dbec905f7eb81f9be
Version: 27.2.0

## Outcome

`deployment/latest` has been refreshed from the canonical Tauri rebuild and now matches the validated chat AI runtime truth path.

## Checks

- Canonical Tauri build: PASS
- Release binary UI proof with embedded assets: PASS
- AppImage UI proof with embedded assets: PASS
- `sha256sum -c deployment/latest/CHECKSUMS.sha256`: PASS
- `bash scripts/autoheal/detect_recurrence.sh`: PASS
- `bash scripts/verify_instructions.sh`: PASS

## Artifact Truth

- AppImage sha256: `c56ea5a8e9c787413028708e5831e331706378c23a4ce2f48e69707eaaf48286`
- DEB sha256: `48988daf0e19297aa1d97b088929418dee8da29cd2e79fd5b60f1d184a648c40`
- Binary sha256: `5602052eb4a90810ac11f418b4b8e5dcfe0c3c1d2bf955fb388a9b42beafdf7b`
