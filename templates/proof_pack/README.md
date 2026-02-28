# Proof Pack — README
<!-- APPEND-ONLY: Do not delete or modify existing entries -->

## Structure

A proof pack is a session-scoped directory capturing all evidence for a TITANE_INFINITY change cycle.

```
proof_packs/<session_id>/
├── run.jsonl               # Machine-readable event log (append-only)
├── README.md               # This file (copied from template)
├── ROOT_CAUSE.md           # Root cause analysis
├── NEXT_ACTION.md          # Next actions (bounded, assignee, deadline)
├── VERDICT_GLOBAL.md       # Global verdict: PASS / FAIL / BLOCKED
├── GATES_REPORT.md         # Per-gate results summary
├── CHANGELOG_FILES.md      # Files changed in this session
├── ROLLBACKS.md            # Rollback instructions
├── PATCHSET_SUMMARY.md     # Summary of all patches applied
└── PHASES/
    ├── P0_DISCOVERY.md
    ├── P1_POLICY_TRUTH.md
    ├── P2_KERNEL_GATES.md
    ├── P3_BUILD_TESTS.md
    ├── P4_UI_COCKPIT.md
    ├── P5_ROUTER_TOOLS.md
    ├── P6_EVALS_REDTTEAM.md
    ├── P7_RAG.md
    └── P8_SEAL_RELEASE.md
```

## Rules (Invariant I8 — Append-Only)

1. **Never delete** entries from `run.jsonl` or any `.md` in a proof pack.
2. **Never overwrite** existing proof files — append new sections with timestamp headers.
3. All JSONL lines must be valid JSON.
4. `VERDICT_GLOBAL.md` must contain exactly one of: `PASS`, `FAIL`, `BLOCKED_RUNNER`, `BLOCKED_INSTRUMENTATION`.
5. A `BLOCKED_*` verdict requires a `cause` and `NEXT_ACTION`.

## Status values

| Status | Meaning |
|--------|---------|
| `PASS` | Gate passed with proof |
| `FAIL` | Gate failed — stop-the-line |
| `BLOCKED_RUNNER` | Cannot run — environment not ready |
| `BLOCKED_INSTRUMENTATION` | Cannot measure — instrumentation missing |
| `WARN` | Observation requiring review |

## Generating a proof pack

```bash
SESSION_ID=my_session bash scripts/proofpack_init.sh
```

## Verifying a proof pack

```bash
bash scripts/proofpack_verify.sh
```
