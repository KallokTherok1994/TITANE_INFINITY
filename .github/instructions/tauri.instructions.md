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
- Add every new Tauri command to `src/lib/security.ts` ALLOWED_COMMANDS or `secureInvoke` will block it.

## Tooling (pnpm-only)

```bash
cd src-tauri && cargo check
cd src-tauri && cargo clippy
cd src-tauri && cargo test --locked
cd src-tauri && cargo fmt --check
pnpm run verify:tauri-only
pnpm run verify:tauri-configs
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

## AutoHeal Gate (Rule 10 — mandatory before verdict)

After every fix in `src-tauri/` or `tauri*.json`:

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

## DONT

- Add implicit network calls or hidden HTTP servers.
- Add new commands without allowlist update and proof.
- Ship a new IPC command without its test counterpart.
- Use `unwrap()` — use `?` or explicit `Result` error handling.
- Utiliser `npm`/`npx` (pnpm uniquement, `npm` interdit).

## Preuves attendues

- Logs E2E/IPC, exports, and config diffs in reports/.
- `docs/IPC_CATALOG.md` updated when IPC changes.
- Test file for every new command.
- `detect_recurrence.sh` exit 0 confirmed.

## Gates specifiques

- verify:tauri-only, verify:tauri-configs.
- Stop-the-line on any FAIL (validator exits non-zero → FAIL, do not proceed).
- Missing IPC test OR missing mapping update → BLOCKED.
- Missing `detect_recurrence.sh` PASS → FAIL.

## Pre-BUILD Backend / Tauri / IPC / HTTP Gate

For any `src-tauri/**`, IPC, capability, config, Rust service, launcher, backend, network, provider, runtime, or Tauri change:

- validate `pnpm run dev:tauri`
- confirm the Tauri DEV window opens and loads the expected current dev URL
- confirm DevTools are available in debug/dev mode
- run Rust/Tauri checks and IPC contract gates
- verify the frontend invoke path matches backend command truth
- verify no permission or capability mismatch
- verify no stale backend binary or runtime state
- verify One Door network and Tauri-only production constraints
- capture terminal logs, DevTools Console, and HTTP/Network traces
- block build on unresolved IPC errors, invoke errors, permission errors, failed local HTTP requests, wrong dev URL, stale preview server, uncontrolled network paths, or backend/frontend mismatch
- update AutoHeal and the proof pack

## Rollback

- git restore -- src-tauri runtime tauri\*.json
