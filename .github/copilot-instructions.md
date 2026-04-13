# TITANE_INFINITY - Copilot Kernel (Governed)

Mode: AUTO
Objective: execute with proof-first discipline and zero drift.

Compatibility markers (required by verifier):

- Local-first (compatibility marker; doctrine active = Online-first governed with mandatory local fallback)
- diagnose -> plan -> apply -> verify -> report

## Priority

- Canonical priority: this file is the constitutional kernel.
- Layer order: kernel -> nearest AGENTS.md -> path-specific instructions -> selected custom agent -> selected prompt file -> task context -> runtime proof/validator truth.
- Lower layers must never redefine higher-layer invariants.

## Status Vocabulary

Use one status vocabulary only:

- PASS / FAIL / BLOCKED / BLOCKED_APPROVAL / DONE / SEALED
- Verdict unique is mandatory.

## Rule 1 - Minimal patch only

Apply the smallest safe change set that solves the task.
No gratuitous refactor.

## Rule 2 - Proof before verdict

No PASS without executable proof.
No DONE/SEALED without relevant checks.

## Rule 3 - 4-Ring architecture

Preserve strict 4-Ring boundaries.
No inverse imports. No Ring1/Ring2 I/O.

## Rule 4 - Tauri-only production runtime

Production runtime is Tauri-only.
Any change to capabilities/allowlist requires explicit tests and rollback.

## Rule 5 - One Door network governance

Allowed path: UI -> canonical IPC -> Services -> Network Gateway -> External.
No uncontrolled UI direct network access.

## Rule 6 - IPC canonical contract

IPC payload contract is mandatory: `{ ok, content, error }`.
Zero silent failure and no lying fallback.

## Rule 7 - Online-first governed with mandatory local fallback

Online-first governed policy is active.
Local fallback is mandatory and operational.

## Rule 8 - Stop-the-line

Stop-the-line on invariant violation, mandatory gate FAIL, unresolved contradiction, or missing proof.
Classify explicitly as FAIL or BLOCKED.

## Rule 9 - NO_SKIPS policy

NO_SKIPS: required checks cannot be skipped by narrative.
If a check cannot run, classify BLOCKED with a next action <= 30 minutes.

## Rule 10 - AutoHeal capture is mandatory and automatic

For **every** code modification (any file change in `src/`, `src-tauri/`, `tests/`, `e2e/`, `scripts/`, `.github/`), automatically and without exception:
- Append one entry to `scripts/autoheal/autoheal_rules.jsonl` (schema: `id, date, scope, symptom, root_cause, fix, prevention_test, commands, files_changed, rollback`).
- Run anti-regression checks relevant to touched scope.
- Run `bash scripts/autoheal/detect_recurrence.sh` — must exit 0 (PASS).
- Run `bash scripts/verify_instructions.sh` — must exit 0 (PASS).
- If either exits non-zero: classify FAIL, do not proceed, rollback immediately.
- AutoHeal entry `id` must be unique; `prevention_test` must include `detect_recurrence`.

## Rule 11 - Production builds on demand

Production builds and deploys are executed **on user request or when needed — no token gate required**.
There are no special tokens, passphrase, or prerequisite messages required to authorize a build or deploy.
Use `BUILD ALL` command (Rule 14) for the full automated build and deploy sequence.
The only pre-build checks are: version bump (Rule 13), relevant test gates, and anti-regression scan (Rule 10).

## Rule 12 - Proof pack and rollback required

Each governed session must produce evidence in proof_packs and reports.
Mandatory: gate report, rollback plan, and final unique verdict.

## Doctrine conflict handling

If contradiction remains unresolved after minimal patch: classify `BLOCKED_DOCTRINE`.

## Rule 13 - Version bump at each advanced BUILD

At each advanced BUILD (tauri build, production build, or any build that produces a distributable artifact), the patch version MUST be incremented by 0.0.1 in `package.json` before building.
Run `node scripts/bump-version.mjs` (or `pnpm run bump:version`) before every advanced build to auto-increment the patch.
After bumping, run `node scripts/sync-versions.mjs` (or `pnpm run sync:versions`) to propagate the new version to Cargo.toml, tauri.conf.json, and runtime config.
This ensures every build artifact carries a unique, traceable version number.
The current version MUST always be visible in the bottom footer of the TITANE interface.

## Operational authority

Only one active execution authority and one active E2E authority at a time.

## Rule 14 - BUILD ALL command

When the user issues `BUILD ALL`, execute the full automated sequence **without any token gate or precondition message**:
1. Bump version per Rule 13 (`node scripts/bump-version.mjs` + `node scripts/sync-versions.mjs`).
2. Production build + deploy (Tauri desktop).
3. Build all artifacts: AppImage, DEB, RPM.
4. Build Android APK.
5. Build Windows installer (if applicable).
6. Uninstall existing system installations and dock icons.
7. Clean and purge all build caches.
8. Reinstall cleanly.
9. Update RELEASE notes, checksums, and RELEASE_SURFACE_INVENTORY.
10. Verify and fix regressions, errors, warnings, and blockers.
11. Run AutoHeal (Rule 10) and ensure everything is up to date, conformant, and optimal.
12. Update all relevant mapping/cartography docs (Rule 15).

## Rule 15 - Auto-update mapping and cartography

Every code modification must automatically update the relevant mapping documents:
- `UI_SURFACE_MAP.md` — if UI surfaces changed.
- `ARCHITECTURE.md` — if architecture changed.
- `OLLAMA_RUNTIME_MAP.md` — if Ollama integration changed.
- `RELEASE_SURFACE_INVENTORY.md` — if version/release surfaces changed.
- `docs/CARTOGRAPHY_COMPLETE.md` — if any structural change.
- `docs/IPC_CATALOG.md` — if IPC commands changed.

Trigger table (which doc to update):

| Changed path | Required doc update |
|---|---|
| `src/**`, `src/components/**`, `src/pages/**` | `UI_SURFACE_MAP.md`, `docs/CARTOGRAPHY_COMPLETE.md` |
| `src-tauri/src/**` (new command) | `docs/IPC_CATALOG.md`, `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md` |
| `src/engines/**`, `src-tauri/src/` (Ring 2) | `ARCHITECTURE.md`, `docs/CARTOGRAPHY_COMPLETE.md` |
| Ollama integration (`src/services/**ollama**`, `src-tauri/src/ollama**`) | `OLLAMA_RUNTIME_MAP.md` |
| Version bump, build artifacts | `RELEASE_SURFACE_INVENTORY.md` |
| `docs/diagrams/**` | `docs/diagrams/README.md`, `docs/diagrams/CANON_INDEX.md` |

If a required mapping doc is **not updated** when its trigger path is modified: classify **FAIL** and stop until corrected.

## Rule 16 - Mandatory test creation

Every new integration, capability, or function must include at the same time:
- Unit tests for the new functionality.
- Integration tests if cross-module.
- E2E tests if user-facing.
- Advanced Q&A scenario tests to validate capabilities.
No feature is complete without its tests.

### Test coverage matrix (Rule 16 enforcement):

| New artifact | Required tests |
|---|---|
| New IPC command (`src-tauri/src/`) | Unit (Rust `#[cfg(test)]`) + contract test in `tests/contract/tauri-ipc-contract.test.ts` |
| New UI component/page (`src/`) | Unit (Vitest) + E2E with `data-testid` selectors in `e2e/` |
| New engine/service (`src/engines/`, `src/services/`) | Unit (Vitest) + Integration test |
| New Ollama/AI integration | Provider test + offline fallback test + Q&A scenario test |
| New capability exposed to user | E2E scenario + Q&A advanced test (verifying real capacity behavior) |
| New build/deploy step | Smoke test verifying artifact presence + checksum |

A gate that detects new source files without corresponding test files classifies the change as BLOCKED until tests exist.
