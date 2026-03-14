# Distribution Refresh Chat AI Rebundle - 2026-03-14

Status: PASS
Date: 2026-03-14T15:16:51Z
Commit: 48f50b45467bd955cd19460dbec905f7eb81f9be
Version: 27.2.0

## Scope

Refresh `deployment/latest` after canonical Tauri rebuild so distributed artifacts embed the validated frontend/runtime truth markers and the chat AI bridge fix.

## Artifacts Published

- `deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage`
- `deployment/latest/TITANE-Infinity_27.2.0_amd64.deb`
- `deployment/latest/titane-infinity`
- Updated top-level manifests and checksum/size files in `deployment/latest/`

## Integrity

- AppImage sha256: `c56ea5a8e9c787413028708e5831e331706378c23a4ce2f48e69707eaaf48286`
- DEB sha256: `48988daf0e19297aa1d97b088929418dee8da29cd2e79fd5b60f1d184a648c40`
- Binary sha256: `5602052eb4a90810ac11f418b4b8e5dcfe0c3c1d2bf955fb388a9b42beafdf7b`
- `sha256sum -c deployment/latest/CHECKSUMS.sha256`: PASS

## Runtime Proof

Canonical Tauri rebuild completed successfully with bundles emitted for AppImage, DEB, RPM and release binary.

Validated runtime truth after rebuild:

- Rebundled release binary UI proof: PASS, DOM attrs present, `data-provider-used="timeout-degraded"`
- Rebundled AppImage UI proof: PASS, DOM attrs present, `data-provider-used="Ollama"`, `data-provider-mode="LOCAL"`, `data-provider-reason="OK"`
- Assistant response proof on AppImage: real Ollama persona response, not OMEGA stub text

## Governance

- `bash scripts/autoheal/detect_recurrence.sh`: PASS
- `bash scripts/verify_instructions.sh`: PASS (20/20)

## Notes

The residual issue from the earlier validation was not a missing frontend feature in source, but stale embedded assets inside the previously tested release binary. The canonical Tauri rebuild resolved that mismatch.
