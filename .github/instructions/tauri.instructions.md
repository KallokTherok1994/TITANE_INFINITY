---
applyTo: 'src-tauri/**, tauri*.json, runtime/**'
---

# Tauri Instructions

## Invariants rappeles

- Ring impacte: Ring 4 (OS/UI).
- Local-first, Tauri-only, allowlist/capabilities stable.
- IPC: { ok, content, error } and zero silence.

## DO

- Justify any new capability with gate + tests.
- Add timeouts and breakers to all I/O.
- Log security-relevant decisions.

## DONT

- Add implicit network calls or hidden HTTP servers.
- Add new commands without allowlist update and proof.

## Preuves attendues

- Logs E2E/IPC, exports, and config diffs in reports/.

## Gates specifiques

- verify:tauri-only, verify:tauri-configs.
- Stop-the-line on any FAIL.

## Rollback

- git restore -- src-tauri runtime tauri\*.json
