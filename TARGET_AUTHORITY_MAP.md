# TARGET_AUTHORITY_MAP

## Runtime authority
- Production authority: Tauri runtime only.
- Browser direct runtime is not the production authority.
- Desktop E2E canonical target: WRY + `tauri-driver`.

## URL target resolution in desktop proof
- If `TAURI_DEV_SERVER_URL` is set:
  - expected source mode defaults to `dev-server`
  - URL target defaults to `${TAURI_DEV_SERVER_URL}/#/chat`
- Else:
  - expected source mode defaults to `embedded`
  - URL target defaults to `tauri://localhost/#/chat`

## Binary authority for desktop E2E
- Wrapper: `scripts/e2e/tauri-wrapper.sh`
- Preferred binary for this session: `src-tauri/target/release/titane-infinity`
- Wrapper enforces E2E guard mode and records a witness log in artifacts.

## Governance controls observed
- One-door policy via canonical frontend -> IPC -> Rust command path.
- AutoHeal entry mandatory per fix.
- Post-fix mandatory checks executed:
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`

## Current authority verdict
- Desktop proof authority is valid and reproducible under embedded Tauri target after harness hardening.