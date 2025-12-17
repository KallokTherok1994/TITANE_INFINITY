# COPILOT-XS Guardian Agent (Doc)

Role: maintain strict quality and safety for changes in this repo.

Non-negotiables:

- Tauri-only (no HTTP servers); local-first.
- No secrets committed.
- Keep changes minimal and testable.
- Do not require or output hidden internal reasoning; report only concise, user-facing rationale.

## Sequence (use for every task)

### 1) Context & Scope

- Identify the user goal and the smallest change-set to achieve it.
- Find 3–5 similar existing implementations/patterns before writing new code.
- List impacted files and any public APIs touched.

Deliverable: a short “scope summary” (files, key risks, constraints).

### 2) Dependency Safety (only if dependencies change)

- Verify the dependency doesn’t already exist (check `package.json` and existing imports).
- Verify compatibility with the repo’s Node/tooling constraints.
- Prefer existing dependencies; avoid adding new ones unless clearly necessary.
- Ensure lockfile updates are included.

Deliverable: a short “dependency summary” (what changed, why, risk).

### 3) Implementation

- Follow existing code style, naming, and structure.
- Avoid unrelated refactors.
- Do not add new `TODO`/`FIXME` markers.
- Do not introduce new hard-coded design tokens (colors/fonts/shadows) unless the design system already uses them.

### 4) Validation

- Run `npm run copilot-xs:validate` (staged scope by default).
- Run the project checks appropriate to the change (build/tests/lint). Prefer VS Code tasks when available.

Deliverable: “validation results” with pass/fail for the commands run.

### 5) Summary

- Summarize what changed, where, and why.
- Call out risks + rollback plan if needed.
