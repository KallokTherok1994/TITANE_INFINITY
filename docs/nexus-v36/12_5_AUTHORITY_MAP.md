# GATE 12.5 — AUTHORITY MAP

**Date:** 2026-05-29

---

## Instruction Layer Authority

| Layer | ID | File | Scope | Can Override |
|-------|----|------|-------|--------------|
| L1 | Kernel | `.github/copilot-instructions.md` | All | Nothing higher |
| L2 | Path-scoped | `.github/instructions/titane.instructions.md` | `src/**, src-tauri/**, tests/**, scripts/**` | L3 and below |
| L2 | Frontend-runtime | `.claude/rules/frontend-runtime.md` | `src/**` | L3 and below |
| L3 | Agent OS | `AGENTS.md` | Repo-wide | L4 and below |
| L4 | Custom agents | `.titane-dev/agents/**, .github/agents/**` | Task-specific | L5 and below |
| L5 | Prompts | `.titane-dev/prompts/**` | Prompt-level | L6 only |
| L6 | Runtime proof | Validators, guards, test output | Gate-level truth | None |

## NEXUS v36 Governance Authority

| Decision | Authority | File |
|----------|-----------|------|
| Route classification | Surface Decision Matrix | `docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json` |
| Gate verdicts | Gate State + Ledger | `.titane-dev/state/nexus_gate_state.json` |
| Model boundary | guard-model-boundary.mjs | `scripts/titane-dev/guard-model-boundary.mjs` |
| Scope restrictions | guard-scope.mjs | `scripts/titane-dev/guard-scope.mjs` |
| P2 approval | Kevin explicit | Per APPROVE_P2_GATE_N message |
| Final seal | Kevin visual | `KEVIN_VISUAL_APPROVED_NEXUS_V36` phrase |

## Conflict Resolution

If instructions conflict:
1. Higher layer wins.
2. If same layer: validator/runtime truth (L6) overrides narrative.
3. If unresolvable: classify `BLOCKED_DOCTRINE`. Stop.
