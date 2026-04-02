# CLINE CONSTITUTIONAL KERNEL — MIRRORS COPILOT AUTHORITY

**CONSTITUTIONAL SOURCE**: `.github/copilot-instructions.md` (canonical priority)  
**CLINE ROLE**: Operationalize Copilot kernel for Cline execution environment  
**PRINCIPLE**: Mirror, never redefine. Preserve all constitutional invariants.

**SURFACE STATUS**:

- Constitutional rules (Rules 1-12): `RUNTIME_ACTIVE` — mirrored by Cline and enforced where hooks exist
- Cline enforcement notes: `SPEC_PARTIAL` — some guarantees are runtime-enforced, others remain operator-validated
- Hook integration requirements: `SPEC_ONLY` — target behavior is documented here; runtime truth lives in hooks and reports
- Authority hierarchy: `RUNTIME_ACTIVE` — Cline remains subordinate to the canonical Copilot instruction stack

---

## EXECUTIVE DIRECTIVE — MODE AUTO

Objective: execute with proof-first discipline and zero drift.

Compatibility markers (required by verifier):

- Local-first (compatibility marker; doctrine active = Online-first governed with mandatory local fallback)
- diagnose → plan → apply → verify → report

---

## CONSTITUTIONAL PRIORITY

- **Canonical priority**: `.github/copilot-instructions.md` is the constitutional kernel
- **Layer order** (platform precedence): Copilot kernel → nearest AGENTS.md → path-specific instructions → selected custom agent → selected prompt file → task context → runtime proof/validator truth
- **Cline mirror placement**: this file operationalizes the kernel for Cline without changing the precedence above
- **Lower layers must never redefine higher-layer invariants**
- **Cline operationalizes but does not override constitutional authority**

---

## STATUS VOCABULARY (MANDATORY)

Use one status vocabulary only:

- **PASS** / **FAIL** / **BLOCKED** / **BLOCKED_APPROVAL** / **DONE** / **SEALED**
- Verdict unique is mandatory

**Cline Implementation**: All hook operations must classify using this vocabulary

---

## CONSTITUTIONAL RULES — MIRRORED FROM COPILOT KERNEL

### Rule 1 — MINIMAL PATCH ONLY

Apply the smallest safe change set that solves the task.
No gratuitous refactor.

**Cline Enforcement**: `SPEC_ONLY` — hooks react to individual Cline events; no file monitoring or refactoring detection implemented

### Rule 2 — PROOF BEFORE VERDICT

No PASS without executable proof.
No DONE/SEALED without relevant checks.

**Cline Enforcement**: `SPEC_ONLY` — PostToolUse logs operations; proof verification is manual by operator

### Rule 3 — 4-RING ARCHITECTURE

Preserve strict 4-Ring boundaries.
No inverse imports. No Ring1/Ring2 I/O.

**Cline Enforcement**: `PARTIAL` — PreToolUse blocks prod build commands and checks for secrets; does not validate 4-Ring boundaries

### Rule 4 — TAURI-ONLY PRODUCTION RUNTIME

Production runtime is Tauri-only.
Any change to capabilities/allowlist requires explicit tests and rollback.

**Cline Enforcement**: Block production build commands without explicit tokens (see Rule 11)

### Rule 5 — ONE DOOR NETWORK GOVERNANCE

Allowed path: UI → canonical IPC → Services → Network Gateway → External.
No uncontrolled UI direct network access.

**Cline Enforcement**: `SPEC_ONLY` — network governance is architectural, not enforced by hooks

### Rule 6 — IPC CANONICAL CONTRACT

IPC payload contract is mandatory: `{ ok, content, error }`.
Zero silent failure and no lying fallback.

**Cline Enforcement**: `SPEC_ONLY` — IPC contract is architectural guidance; no automated validation

### Rule 7 — ONLINE-FIRST GOVERNED WITH MANDATORY LOCAL FALLBACK

Online-first governed policy is active.
Local fallback is mandatory and operational.

**Cline Enforcement**: `SPEC_ONLY` — fallback validation is manual/test-based

### Rule 8 — STOP-THE-LINE

Stop-the-line on invariant violation, mandatory gate FAIL, unresolved contradiction, or missing proof.
Classify explicitly as FAIL or BLOCKED.

**Cline Enforcement**: `PARTIAL` — PreToolUse blocks prod builds (FAIL); PostToolUse logs failures; no automatic stop-the-line orchestration

### Rule 9 — NO_SKIPS POLICY

NO_SKIPS: required checks cannot be skipped by narrative.
If a check cannot run, classify BLOCKED with a next action <= 30 minutes.

**Cline Enforcement**: `PARTIAL` — hooks inject reminders for deploy/test/package; no-skips is enforced by operator discipline, not automated gate

### Rule 10 — AUTOHEAL CAPTURE IS MANDATORY PER FIX

For each fix, append one entry to `scripts/autoheal/autoheal_rules.jsonl`.

Then run:

- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

**Cline Enforcement**: `MANUAL` — AutoHeal capture is disabled in PostToolUse; entries are written manually by operator after each fix

### Rule 11 — PROD TOKEN GATE

No PROD action without exact tokens:

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

**Cline Enforcement**: `RUNTIME_ACTIVE` — PreToolUse blocks `tauri build`/`Build Titan-Stable`/`build:production` without exact tokens

### Rule 12 — PROOF PACK AND ROLLBACK REQUIRED

Each governed session must produce evidence in proof_packs and reports.
Mandatory: gate report, rollback plan, and final unique verdict.

**Cline Enforcement**: `MANUAL` — PostToolUse logs to operations.log; proof packs are created manually by operator per session

---

## DOCTRINE CONFLICT HANDLING

If contradiction remains unresolved after minimal patch: classify `BLOCKED_DOCTRINE`.

**Cline Implementation**: Escalate to Copilot kernel resolution, do not resolve independently

---

## OPERATIONAL AUTHORITY

Only one active execution authority and one active E2E authority at a time.

**Cline Integration**: Respect agent routing from `.github/copilot-routing.json`

---

## CLINE-SPECIFIC OPERATIONALIZATION

> **STATUS: `SPEC_ONLY`** — This section describes target/intended hook behavior. Actual hook implementations are in `.clinerules/hooks/`. See `reports/cline_rules_hooks_truth_report.md` for runtime truth.

### Hook Integration Requirements (Target Behavior)

- **TaskStart**: Inject constitutional context, not competing rules
- **PostToolUse**: Log operations; classify failures only (no fake-PASS)
- **PreToolUse**: Block prod builds without tokens; check for secrets in src/**
- **UserPromptSubmit**: Remind deploy/test/package gates when relevant

### File Path Integration

- Hooks reference `.github/copilot-routing.json` for agent authority context
- AutoHeal entries written manually to `scripts/autoheal/autoheal_rules.jsonl` after each fix
- `scripts/verify_instructions.sh` run manually after AutoHeal entries

### Validator Integration

Required validation commands (run manually by operator):

- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`

---

## AUTHORITY HIERARCHY — CLINE COMPLIANCE

1. **Constitutional Kernel**: `.github/copilot-instructions.md` (canonical)
2. **Repo / Scoped AGENTS**: `AGENTS.md` and nearest scoped `AGENTS.md`
3. **Path Instructions**: `.github/instructions/*.instructions.md`
4. **Selected Custom Agent / Prompt**: when applicable in the active run
5. **Agent Routing**: `.github/copilot-routing.json`
6. **Cline Mirror**: `.clinerules/00-kernel.md` (this file - operationalizes only)
7. **Cline Rules**: `.clinerules/*.md` (supporting only, never contradicting)
8. **Task Context**: User requests within constitutional bounds

**Cline must never redefine higher-layer invariants.**

---

## STATUS: CONSTITUTIONAL_MIRROR_ACTIVE

**Authority**: Mirrors `.github/copilot-instructions.md` (ver. 9fd454545)
**Date**: 2026-03-24
**Enforcement**: Cline hooks operationalize this kernel  
**Validation**: scripts/verify_instructions.sh
