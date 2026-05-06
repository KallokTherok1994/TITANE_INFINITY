---
mode: agent
description: >
  Autopilot runner for a single governed lock in the TITANE Advanced Intelligence Program.
  Executes one lock only. Forbids next-lock execution. Validator repair loop enforced.
  Proof pack required. Returns control after lock completes.
---

# TITANE Autopilot Lock Runner

> **Agent**: invoke `titane-conductor` for orchestration decisions during lock execution.

## Operating Contract

```txt
EXEC_MODE: AUTOPILOT_SINGLE_LOCK
AUTONOMY: automatic inside the active lock
FORBIDDEN: execute next lock without explicit user reentry
PROOF_RULE: no PASS/DONE/SEALED without validator output
COMMIT_RULE: one proven lock = one targeted commit
RETURN_CONTROL_AFTER_LOCK: true
```

## Mutation Allowlist (A0)

Autopilot may ONLY modify these paths during Lock A0:

```txt
.github/copilot-instructions.md
.github/instructions/**
.github/agents/**
.github/prompts/**
AGENTS.md
src/AGENTS.md
src-tauri/AGENTS.md
e2e/AGENTS.md
docs/AGENTS.md
scripts/AGENTS.md
governance/layer_priority.yaml
scripts/verify/**
scripts/verify_instructions.sh
scripts/autoheal/**   # autoheal_rules.jsonl canonical path defined in L1 kernel
docs/research/**
docs/roadmap/**
docs/instructions/**
docs/governance/**
reports/**
proof_packs/**
```

Autopilot MUST NOT modify during A0:

```txt
src/** (except AGENTS.md)
src-tauri/src/**
tests/**
e2e/** (except AGENTS.md)
data/**
package.json
Cargo.toml
Cargo.lock
pnpm-lock.yaml
README.md
CHANGELOG.md
RELEASE_SURFACE_INVENTORY.md
deployment/**
```

## Stoplines

Stop and return `BLOCKED_APPROVAL` if:

```txt
- unrelated uncommitted work exists and could be overwritten
- git branch/worktree state is unsafe
- required governance files missing and cannot be safely recreated
- lower layer overrides a higher-layer invariant
- status vocabulary is duplicated outside canonical authority
- BUILD ALL is redefined outside canonical authority
- local-first-only doctrine introduced or remains active
- online-first governed with mandatory local fallback is weakened
- public web claim promoted into doctrine without source/date/relevance
- more than 20 files would need changes for active lock
- runtime code would need to be modified
```

## Validator Repair Loop

```txt
1. Run required validators
2. If a validator FAILS after mutation:
   a. Stop next work
   b. Identify root cause
   c. Apply ONE minimal repair
   d. Rerun failing validator
   e. Rerun detect_recurrence.sh
   f. Repeat at most twice
3. If still FAIL after 2 repair attempts:
   VERDICT: FAIL
   Provide exact rollback commands
4. If all PASS:
   Continue to proof pack
```

## Proof Pack Requirement

Every lock execution must produce:

```txt
proof_packs/LOCK_<ID>_<NAME>_<YYYY-MM-DD>/
  VERDICT.md      — required, kernel vocabulary only (PASS|FAIL|BLOCKED|DONE|SEALED)
  ROLLBACK.md     — required, exact git commands
  VALIDATORS.log  — required, verbatim validator output + exit codes
  FILES_CHANGED.md
  AUTHORITY_MAP.md
  DRIFT_MATRIX.md
  RESEARCH_SOURCE_MAP_SUMMARY.md
  AUTOPILOT_BOUNDARY.md
  NEXT_LOCKS.md
```

## Final Report Format

After lock execution, report MUST start exactly:

```txt
VERDICT:
LOCK_ID:
LOCK_NAME:
MODE: DURABLE
EXEC_MODE: AUTOPILOT_SINGLE_LOCK
MUTATIONS:
FILES_CHANGED:
VALIDATORS_RUN:
RESEARCH_STATUS:
AUTOPILOT_BOUNDARY_STATUS:
PROOF_PACK:
COMMIT:
NEXT_LOCK:
```

Followed by sections:

```txt
1. Current Real State
2. Authority Map
3. Research Source Map Summary
4. Autopilot Boundary Summary
5. Drift Found
6. Patch Applied
7. Files Changed
8. Validators Run
9. Validator Results
10. Proof Artifacts
11. Rollback Commands
12. Remaining Risks
13. Next Lock Reentry Prompt Summary
```

## Autopilot Boundary

```txt
- Execute ONLY the active lock specified in the session prompt
- Do NOT continue to the next lock automatically
- After lock: return VERDICT report and wait for user
- Next lock starts ONLY on explicit user reentry with new lock specification
- No implicit continuation, no scope creep, no program-wide execution
```

Validators for this prompt:

```bash
bash scripts/verify/verify_autopilot_lock_bounds.sh
bash scripts/verify/verify_copilot_instruction_source_map.sh
```
