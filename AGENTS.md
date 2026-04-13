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
- Production builds and deploys on user request — no token gate (Rule 11).
- `BUILD ALL` triggers full automated build sequence (Rule 14).
- Every modification triggers auto anti-regression and AutoHeal (Rule 10).
- Every modification updates relevant mapping/cartography docs (Rule 15).
- Every new feature/integration requires tests (Rule 16).

## Ask-First Workflow

- Prefer Ask/plan mode first for mapping, audits, architecture questions, dependency diagnosis, and broad changes.
- Switch to patch/code mode only after scope is fixed, touched files are known, one dominant lock is identified, and rollback is obvious.
- Keep one real lock at a time.

## Agent Specialization

### Backend Agent (src-tauri/, Rust)

- Scope: Ring0/Ring1 — Tauri commands, IPC, capabilities, Rust services.
- Gate: IPC contract `{ ok, content, error }` must be preserved.
- Required: allowlist update + integration tests for new commands.
- AutoHeal: append entry on every fix.

### Frontend Agent (src/, TypeScript/React)

- Scope: Ring4 — UI components, pages, hooks, stores, engines.
- Gate: stable `data-testid` selectors; ErrorBoundary on every new component.
- Required: E2E tests for user-facing changes; registry/ui-events.jsonl entry.
- AutoHeal: append entry on every fix.

### QA Agent (tests/, e2e/)

- Scope: Ring4 — unit tests, integration tests, E2E harness.
- Gate: no feature without tests (Rule 16); deterministic selectors only.
- Required: E2E logs + screenshots as proof artifacts.
- Reference: `e2e/AGENTS.md` for E2E discipline.

### Security Agent (governance/, sbom/, scripts/verify/)

- Scope: Cross-ring — SBOM, governance, audit trails.
- Gate: no uncontrolled network; capabilities locked.
- Required: SBOM update on dependency change; audit log entry.

### Build Agent (scripts/, .github/workflows/)

- Scope: CI/CD — build, release, artifact generation.
- Gate: Rule 11 (on-demand), Rule 13 (version bump), Rule 14 (BUILD ALL sequence).
- Required: version bump before every advanced build; update RELEASE_SURFACE_INVENTORY.

## Chain-of-Thought Validation

Before applying any patch:

1. Identify which Ring(s) are touched.
2. Verify no inverse imports or Ring boundary violations.
3. Confirm IPC contract preserved if IPC changed.
4. Confirm tests exist or will be created (Rule 16).
5. Plan AutoHeal entry (Rule 10).
6. Identify which mapping docs need updating (Rule 15).

## Canonical Commands

- `pnpm run check`
- `pnpm run verify:instructions`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
- `bash scripts/autoheal/detect_recurrence.sh`

## Proof Discipline

- Report real commands, real outputs, and explicit limits.
- If a proof cannot run, classify `BLOCKED` or `PARTIAL` with the next action.
- Route repeated binary rules to validators instead of duplicating prose.

## Integration Patterns

- New IPC command: add to `src-tauri/src/`, update allowlist, add to `src/lib/security.ts` ALLOWED_COMMANDS, add tests.
- New UI surface: add `data-testid`, add to `registry/ui-events.jsonl`, update `UI_SURFACE_MAP.md`, add E2E test.
- New Ollama integration: update `OLLAMA_RUNTIME_MAP.md`, add provider tests.

## Not In Scope

- Product behavior details owned by local `src/**/AGENTS.md`.
- Local sandbox, approval, model, and network posture.
- Full constitutional doctrine duplication.
