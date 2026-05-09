---
description: Route the session to the Temporal Modules specialist for TIME, agenda, energy, priority, and scheduler hardening.
mode: agent
---

# Prompt: Temporal Modules

> **Agent**: invoke `temporal-modules` specialist agent for this session.

## Scope

Use this prompt when the request touches TIME publication, agenda handling, energy prediction, priority scoring, or chat-driven temporal commands.

## Steps

1. Restore session context and snapshot the worktree.
2. Inspect the active temporal surfaces and their tests before editing.
3. Fix the smallest truthful slice that closes the temporal gap.
4. Add or update Vitest coverage for the touched temporal invariant.
5. If a UI or native runtime surface changed, add the matching proof lane.
6. Run `bash scripts/autoheal/detect_recurrence.sh` and `bash scripts/verify_instructions.sh` before closure.

## Exit criteria

- The temporal truth is aligned across frontend, runtime, backend, and native lanes.
- All touched tests pass and no fake TIME context remains.
- Rollback is documented and bounded.
