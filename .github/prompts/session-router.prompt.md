---
description: Route the current session to the correct execution path before starting work. Classifies as PATH_SIMPLE, PATH_HEAVY, EXPLORATION, DURABLE, HOLD, or REENTRY.
mode: agent
---

# Prompt: Session Router

## Scope

Classify the current session before starting any work.

## Routing Table

| Mode | Trigger | Path | Validators | Proof Pack |
|------|---------|------|------------|------------|
| PATH_SIMPLE | Single file, local rule, doc-only | `detect_recurrence.sh` only | No |
| PATH_HEAVY | Cross-ring, IPC, build, E2E, release | Full suite | Required |
| EXPLORATION | Branch `explore/*` or `MODE=EXPLORATION` declared | Reduced AutoHeal | No |
| DURABLE | Default for `MAIN`, `feature/*` | Full Rule 1–18 | Required |
| HOLD | Incomplete proof, pending gate | Block new work | N/A |
| REENTRY | Session resume with pending Rule 18 phases | Commit pending first | Per phase |

## Steps

1. Read available session plan or summary (Rule 20).
2. Run `git status --short` — identify uncommitted work.
3. Declare MODE explicitly (DURABLE or EXPLORATION).
4. Match current task against routing table above.
5. If PATH_HEAVY or DURABLE: load `heavy-runtime-session.prompt.md`.
6. If PATH_SIMPLE or EXPLORATION: load `simple-fast-session.prompt.md`.
7. If REENTRY: commit any Rule 18 phases with green proofs before new work.
8. If HOLD: do not start new work until blocking gate is resolved.

## Anti-fake-PASS

Do not claim session classified without reading git status and declaring MODE.
