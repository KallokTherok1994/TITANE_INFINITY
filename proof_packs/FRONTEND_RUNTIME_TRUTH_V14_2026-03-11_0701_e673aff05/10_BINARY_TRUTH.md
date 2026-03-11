# 10 BINARY TRUTH

## Installed binary inventory
| path | version | date | source |
|------|---------|------|--------|
| /usr/bin/titane-infinity | 27.2.0 | 2026-03-07 | DEB package |

## Source vs binary delta
| aspect | source (HEAD e673aff05) | binary (2026-03-07) |
|--------|------------------------|---------------------|
| duplicate route | FIXED (V13, 2026-03-11) | NOT FIXED (pre-V13) |
| zoom normalization | FIXED (V12, 2026-03-11) | NOT FIXED (pre-V12) |
| all other UI | same | same |

## WDIO binary selection (tauri-wrapper.sh)
- TAURI_BINARY_PATH: not set
- TAURI_DEV_SERVER_URL: not set
- Checked paths (in order): TAURI_BINARY_PATH → runtime/stable/ AppImage → deployment/latest AppImage → ...
- Resolved: /usr/bin/titane-infinity (last fallback)

## Verdict
- Binary stale: TRUE
- Critical failure caused by stale binary: NONE
- Required action: rebuild and redeploy (P2, maintenance, not P0)

## Status: STALE_P2
