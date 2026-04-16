---
applyTo: 'src-tauri/**, tauri*.json, runtime/**'
---

# Tauri Instructions

## Invariants rappeles

- Ring impacte: Ring 0 (Kernel Rust) and Ring 1 (Types/Config).
- Local-first (marqueur de compatibilité), doctrine active: online-first gouverné avec fallback local obligatoire.
- Tauri-only, allowlist/capabilities stable.
- IPC: { ok, content, error } and zero silence.

## DO

- Pour chaque nouvel agent kernel (Rust, Ring 0/1), documenter dans `ARCHITECTURE.md` et `docs/IPC_CATALOG.md`.
- Ajouter un test unitaire Rust et un test contractuel TypeScript pour chaque nouvelle commande IPC liée à un agent.

- Justify any new capability with gate + tests.
- Add timeouts and breakers to all I/O.
- Log security-relevant decisions.
- Update `docs/IPC_CATALOG.md` and `ARCHITECTURE.md` for any new IPC command (Rule 15).
- Create unit (Rust `#[cfg(test)]`) + contract test in `tests/contract/tauri-ipc-contract.test.ts` for every new IPC command (Rule 16).

## DONT

- Add implicit network calls or hidden HTTP servers.
- Add new commands without allowlist update and proof.
- Ship a new IPC command without its test counterpart.
- Utiliser `npm`/`npx` (pnpm uniquement, `npm` interdit).

## Preuves attendues

- Logs E2E/IPC, exports, and config diffs in reports/.
- `docs/IPC_CATALOG.md` updated when IPC changes.
- Test file for every new command.

## Gates specifiques

- verify:tauri-only, verify:tauri-configs.
- Stop-the-line on any FAIL (validator exits non-zero → FAIL, do not proceed).
- Missing IPC test OR missing mapping update → BLOCKED.

## Rollback

- git restore -- src-tauri runtime tauri\*.json
