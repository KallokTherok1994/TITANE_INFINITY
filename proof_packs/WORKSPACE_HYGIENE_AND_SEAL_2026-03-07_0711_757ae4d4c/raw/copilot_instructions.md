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

## Rule 10 - AutoHeal capture is mandatory per fix

For each fix, append one entry to `scripts/autoheal/autoheal_rules.jsonl`.
Then run:

- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`

## Rule 11 - PROD token gate

No PROD action without exact tokens:

- `GO_FOR_PROD_BUILD__TITANE_INFINITY`
- `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

## Rule 12 - Proof pack and rollback required

Each governed session must produce evidence in proof_packs and reports.
Mandatory: gate report, rollback plan, and final unique verdict.

## Doctrine conflict handling

If contradiction remains unresolved after minimal patch: classify `BLOCKED_DOCTRINE`.

## Operational authority

Only one active execution authority and one active E2E authority at a time.
