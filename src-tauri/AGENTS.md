# Local AGENTS - src-tauri

## Authority

Tauri runtime local discipline — Ring 0 (Kernel Rust) and Ring 1 (Types/Config).

## Rules

- Preserve allowlist/capabilities control — no unproven capability without gate + tests.
- Preserve IPC canonical contract `{ ok, content, error }` — zero silent failures.
- Add bounded I/O, explicit error paths, and timeouts to all I/O.
- Log security-relevant decisions.
- New IPC command: update allowlist + add to `src/lib/security.ts` ALLOWED_COMMANDS + update `docs/IPC_CATALOG.md` + `ARCHITECTURE.md` (Rule 15).
- New IPC command: create unit (`#[cfg(test)]`) + contract test in `tests/contract/tauri-ipc-contract.test.ts` (Rule 16).
- Auto anti-regression: run `detect_recurrence.sh` after every fix (Rule 10).

## Chain-of-Thought Validation

1. Confirm Ring 0/1 boundary — no inverse import from Ring 3/4.
2. Confirm IPC return type is `{ ok, content, error }` with no hidden failure paths.
3. Verify capability is declared in `tauri.conf.json` allowlist.
4. Confirm corresponding `ALLOWED_COMMANDS` entry exists in `src/lib/security.ts`.
5. Confirm `docs/IPC_CATALOG.md` and `ARCHITECTURE.md` are updated (Rule 15).
6. Confirm unit + contract tests created (Rule 16).

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

## AutoHeal Gate (Rule 10 — mandatory)

After every fix touching `src-tauri/`:

```bash
bash scripts/autoheal/detect_recurrence.sh  # must exit 0
bash scripts/verify_instructions.sh          # must exit 0
```

## Integration Patterns

- New Tauri command: add `#[tauri::command]` fn + register in `src-tauri/src/lib.rs` (or equivalent) + update `tauri.conf.json` allowlist + add to `src/lib/security.ts` ALLOWED_COMMANDS + update `docs/IPC_CATALOG.md`.
- New capability: justify in commit message + add test gate + add to allowlist.
- New I/O path: add explicit timeout, bounded buffer, and error return.
- Dependency update: run `cargo audit`, update `Cargo.lock`, commit both.

## Proofs

- Tauri config validation output (`pnpm run verify:tauri-configs`).
- IPC/runtime logs in `reports/`.
- `docs/IPC_CATALOG.md` updated (Rule 15).
- Unit + contract test present (Rule 16).

## Not in scope

- Global governance wording and final verdict taxonomy (kernel-owned).
