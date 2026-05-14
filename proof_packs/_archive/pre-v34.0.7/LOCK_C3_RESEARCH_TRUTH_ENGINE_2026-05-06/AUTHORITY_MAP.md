# Authority Map — LOCK C3 Research Truth Engine

**Lock:** C3  
**Date:** 2026-05-06  

## Ring Ownership

| Ring | Scope | Owner Agent | Boundary |
|------|-------|-------------|----------|
| Ring 3 | `src/services/research_truth/` | Frontend Agent | TypeScript contract + tests |
| Docs | `docs/research/`, `docs/registry/`, `docs/roadmap/` | Docs-Registry Agent | Append-only + updates |
| Scripts | `scripts/verify/verify_research_truth_engine.sh` | QA Agent | Validator gate |
| AutoHeal | `scripts/autoheal/autoheal_rules.jsonl` | AutoHeal subsystem | Append-only |

## Responsible Agents

| Agent | Responsibility |
|-------|----------------|
| `titane-conductor` | Orchestration + lock completion verdict |
| Frontend Agent | Contract implementation (TypeScript/Zod) |
| QA Agent | Test coverage (77 tests) + validator |
| Docs-Registry Agent | 5 registry updates + docs/research/ |
| AutoHeal | Recurrence prevention + entry |

## Layer Authority (L1-L6)

| Layer | File | Authority |
|-------|------|-----------|
| L1 | `.github/copilot-instructions.md` | Constitutional kernel — governs all |
| L2 | `.github/instructions/frontend.instructions.md` | Frontend patterns |
| L3 | `AGENTS.md` | Repo-scoped agent guidance |
| L4 | `titane-conductor` | Lock orchestration |
| L5 | This proof pack | Execution evidence |
| L6 | vitest 77/77 + validator PASS | Mechanical truth |

## IPC Changes

None — C3 is a pure TypeScript/Zod contract layer. No Tauri commands added.

## Capability Changes

None — C3 is T3 flag-gated, passive by default.
