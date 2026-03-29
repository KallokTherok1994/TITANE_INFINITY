# TITANE∞ - Root AGENTS

## Authority

Repo-scoped guidance for Codex and adjacent agents.
This file owns durable repo context only.
Local execution posture belongs to `~/.codex/config.toml`.
Heavy doctrine belongs to the local Codex rules file, not to the repo.

## Invariants

- Tauri-only production runtime.
- 4-Ring boundaries must stay intact.
- One Door network: UI -> IPC -> services -> gateway -> external.
- Minimal patch only.
- No fake state, no fake PASS, no silent fallback.
- Proof-first and rollback-ready.

## Ask-First Workflow

- Prefer Ask/plan mode first for mapping, audits, architecture questions, dependency diagnosis, and broad changes.
- Switch to patch/code mode only after scope is fixed, touched files are known, one dominant lock is identified, and rollback is obvious.
- Keep one real lock at a time.

## Canonical Commands

- `pnpm run check`
- `pnpm run verify:instructions`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`

## Proof Discipline

- Report real commands, real outputs, and explicit limits.
- If a proof cannot run, classify `BLOCKED` or `PARTIAL` with the next action.
- Route repeated binary rules to validators instead of duplicating prose.

## Not In Scope

- Product behavior details owned by local `src/**/AGENTS.md`.
- Local sandbox, approval, model, and network posture.
- Full constitutional doctrine duplication.
