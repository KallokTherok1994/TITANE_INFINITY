# CLINE CONSTITUTIONAL KERNEL — MIRRORS COPILOT AUTHORITY

**CONSTITUTIONAL SOURCE**: `.github/copilot-instructions.md` (canonical priority)  
**CLINE ROLE**: Operationalize Copilot kernel for Cline execution environment  
**PRINCIPLE**: Mirror, never redefine. Preserve all constitutional invariants.

---

## EXECUTIVE DIRECTIVE — MODE AUTO

Objective: execute with proof-first discipline and zero drift.

Compatibility markers (required by verifier):

- Local-first (compatibility marker; doctrine active = Online-first governed with mandatory local fallback)
- diagnose → plan → apply → verify → report

---

## CONSTITUTIONAL PRIORITY

- **Canonical priority**: `.github/copilot-instructions.md` is the constitutional kernel
- **Layer order**: Copilot kernel → nearest AGENTS.md → path-specific instructions → selected custom agent → selected prompt file → task context → runtime proof/validator truth
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

**Cline Enforcement**: Hooks monitor file changes, block broad refactors

### Rule 2 — PROOF BEFORE VERDICT

No PASS without executable proof.
No DONE/SEALED without relevant checks.

**Cline Enforcement**: PostToolUse must verify proof artifacts before PASS classification

### Rule 3 — 4-RING ARCHITECTURE

Preserve strict 4-Ring boundaries.
No inverse imports. No Ring1/Ring2 I/O.

**Cline Enforcement**: PreToolUse validates architecture boundaries before file operations

### Rule 4 — TAURI-ONLY PRODUCTION RUNTIME

Production runtime is Tauri-only.
Any change to capabilities/allowlist requires explicit tests and rollback.

**Cline Enforcement**: Block production build commands without explicit tokens (see Rule 11)

### Rule 5 — ONE DOOR NETWORK GOVERNANCE

Allowed path: UI → canonical IPC → Services → Network Gateway → External.
No uncontrolled UI direct network access.

**Cline Enforcement**: PreToolUse validates network access patterns

### Rule 6 — IPC CANONICAL CONTRACT

IPC payload contract is mandatory: `{ ok, content, error }`.
Zero silent failure and no lying fallback.

**Cline Enforcement**: Validate IPC implementations in src-tauri operations

### Rule 7 — ONLINE-FIRST GOVERNED WITH MANDATORY LOCAL FALLBACK

Online-first governed policy is active.
Local fallback is mandatory and operational.

**Cline Enforcement**: Validate fallback implementations exist

### Rule 8 — STOP-THE-LINE

Stop-the-line on invariant violation, mandatory gate FAIL, unresolved contradiction, or missing proof.
Classify explicitly as FAIL or BLOCKED.

**Cline Enforcement**: Hooks implement immediate FAIL classification and operation blocking

### Rule 9 — NO_SKIPS POLICY

NO_SKIPS: required checks cannot be skipped by narrative.
If a check cannot run, classify BLOCKED with a next action <= 30 minutes.

**Cline Enforcement**: All hooks enforce checks, no narrative bypass allowed

### Rule 10 — AUTOHEAL CAPTURE IS MANDATORY PER FIX

For each fix, append one entry to `scripts/autoheal/autoheal_rules.jsonl`.

Then run:

- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

**Cline Enforcement**: PostToolUse automatically captures qualifying fixes

### Rule 11 — PROD TOKEN GATE

No PROD action without exact tokens:

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

**Cline Enforcement**: Maintain existing deployment safeguards, enhance with token checking

### Rule 12 — PROOF PACK AND ROLLBACK REQUIRED

Each governed session must produce evidence in proof_packs and reports.
Mandatory: gate report, rollback plan, and final unique verdict.

**Cline Enforcement**: Session tracking in hooks, automatic proof pack generation

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

### Hook Integration Requirements

- **TaskStart**: Inject constitutional context, not competing rules
- **PostToolUse**: Classify all operations with status vocabulary
- **PreToolUse**: Validate constitutional boundaries before operations
- **UserPromptSubmit**: Pre-check constitutional gates

### File Path Integration

- Monitor `.clinerules/` for constitutional rule files
- Reference `.github/copilot-routing.json` for agent authority
- Integrate with `scripts/autoheal/` and `scripts/verify_instructions.sh`

### Validator Integration

Required validation commands:

- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`

---

## AUTHORITY HIERARCHY — CLINE COMPLIANCE

1. **Constitutional Kernel**: `.github/copilot-instructions.md` (canonical)
2. **Cline Mirror**: `.clinerules/00-kernel.md` (this file - operationalizes only)
3. **Agent Routing**: `.github/copilot-routing.json`
4. **Path Instructions**: `.github/instructions/*.instructions.md`
5. **Specialized Agents**: `.github/agents/*.agent.md`
6. **Cline Rules**: `.clinerules/*.md` (supporting only, never contradicting)
7. **Task Context**: User requests within constitutional bounds

**Cline must never redefine higher-layer invariants.**

---

## STATUS: CONSTITUTIONAL_MIRROR_ACTIVE

**Authority**: Mirrors `.github/copilot-instructions.md` (ver. 9fd454545)
**Date**: 2026-03-18
**Enforcement**: Cline hooks operationalize this kernel  
**Validation**: scripts/verify_instructions.sh
