# TITANE_INFINITY - Copilot Instructions (Governed)

Mode: AUTO, Stop-the-line strict
Goal: Update and seal repo instructions with proofs
Scope: repo-wide

## A) Invariants

**DO**

- Online-first governed. Network allowed via controlled surfaces only. Local fallback mandatory.
- Tauri-only. No web server/preview and no internal HTTP "server/" API.
- 4-Ring architecture (Types -> Engines -> Services -> Modules/UI).
- allowlist/capabilities are stable and justified with gates and tests.

**DONT**

- Run any web server/preview or add network reach without explicit approval and gates.
- Add new capabilities without a proof and rollback path.

**Proof**

- Verify scripts and logs in reports/.

**Gate**

- Stop-the-line if any invariant is broken.

## B) Workflow standard

**DO**

- diagnose -> plan -> apply -> verify -> report
- Keep changes minimal and scoped.

**DONT**

- Defer proof or verification to later.

**Proof**

- Logs, diffs, and PASS markers in reports/.

**Gate**

- Any FAIL stops the run immediately.

## C) Policy PROD (neutral)

**DO**

- Require exact tokens before any prod build or deploy.

**Tokens**

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

**DONT**

- Infer or approximate tokens.

**Proof**

- VERDICT.md in proof pack.

## C.1) Version Sync Gate (mandatory before PROD)

**DO (before any prod build/deploy):**

- Synchronize release version in all canonical files:
	- `package.json`
	- `src-tauri/Cargo.toml`
	- `src-tauri/tauri.conf.json`
- Synchronize deployment metadata with the same target version:
	- `deployment/latest/MANIFEST.json`
	- `deployment/latest/SHA256SUMS_v<version>.txt`
	- `deployment/latest/SIZES_v<version>.txt`

**DONT:**

- Launch prod build/deploy with mixed versions (stop-the-line).

**Gate:**

- Any mismatch between app/bundle/deployment version = FAIL.

## D) Anti-silence (UI/IPC/Chat)

**DO**

- Always respond with success or visible error.
- IPC returns { ok, content, error }.
- Les erreurs doivent être attribuées à leur cause racine: IPC\_\* ≠ ProviderDown.
- Toujours en français dans tes instructions.

**DONT**

- Leave UI or IPC in a silent state.

**Proof**

- E2E logs and exports.

## E) Ring-by-ring rules

Ring 1 (Types):

- DO: strict schemas, no runtime logic.
- DONT: I/O or side effects.

Ring 2 (Engines):

- DO: pure logic, deterministic, no I/O.
- DONT: network, file system, time-based randomness.

Ring 3 (Services):

- DO: controlled I/O, timeouts, breakers, logs.
- DONT: unbounded retries.

Ring 4 (Modules/UI):

- DO: visible errors, ErrorBoundary, stable data-testid when E2E.
- DONT: silent failures.

## F) No direct invoke

**DO**

- Use the canonical TS <-> Tauri client only.

**DONT**

- Scatter raw invoke calls across the codebase.

## G) Tests and gates before DONE

**DO**

- Run required tests and gates for the touched ring.
- Record proof in reports/.

**DONT**

- Mark DONE without PASS evidence.

## H) Rollback

**DO**

- Provide git restore or git revert steps.

**DONT**

- Use destructive commands.

## Change metadata requirement

**DO**

- For any change proposal, state Ring impacted and Status: EXPERIMENTAL, QUALIFIED, or STABLE.
- For UI changes, append registry/ui-events.jsonl entry.
