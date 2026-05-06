# Authority Map — TITANE_INFINITY Instruction System
# Date: 2026-05-06 | Session: AUTO UPDATE INSTRUCTIONS SYSTEM v2

| Layer | ID | File(s) | Current Status | Count | Issues |
|-------|-----|---------|---------------|-------|--------|
| L1 | constitutional-kernel | `.github/copilot-instructions.md` | ACTIVE | 131 lines (max 220 ✓) | None |
| L2 | path-specific-instructions | `.github/instructions/*.instructions.md` | ACTIVE | 6 files | None |
| L3 | local-agents | `AGENTS.md`, `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md` | ACTIVE | 6 files | None |
| L4 | custom-agents | `.github/agents/*.agent.md` | ACTIVE | 27 files | None |
| L5 | reusable-prompts | `.github/prompts/*.prompt.md` | ACTIVE | 10 files (9 required ✓) | None |
| L6 | mechanical-truth | `scripts/verify/*.sh`, `scripts/autoheal/*`, `governance/*` | ACTIVE | 66+ validators | None |
| LEGACY | copilot-agents | `.github/copilot-agents/` | LEGACY (isolated) | 12 files | None — README marks non-authority, validator guard active |

## L2 Instruction Files

| File | applyTo | Status |
|------|---------|--------|
| `frontend.instructions.md` | `src/**` | ACTIVE |
| `tauri.instructions.md` | `src-tauri/**, tauri*.json, runtime/**` | ACTIVE |
| `tests-e2e.instructions.md` | `e2e/**, scripts/e2e/**, wdio*.conf*` | ACTIVE |
| `titane.instructions.md` | `src/**, src-tauri/**, tests/**, scripts/**` | ACTIVE |
| `hybrid-memory-dispatch.instructions.md` | cross-ring | ACTIVE |
| `docs-registry.instructions.md` | `docs/**, reports/**, proof_packs/**` | ACTIVE |

## L4 Agents (27 total)

Core Guardians: architect-guardian, anti-regression-guardian, audit-subagent, dependency-guardian, docs-registry, e2e-authority, tauri-safety, test-autofix, implement-subagent, review-subagent
Boundary: ollama-dev-chat-boundary, tool-selector-panel, release-proof, titane-conductor
Memory Masters (12): memory-architecture-master, memory-backend-master, memory-explainability-analyst, memory-frontend-master, memory-graph-relations, memory-migration-analyst, memory-orchestrator, memory-qa-ops-master, memory-regression-authority, memory-release-validator, memory-root-commander, memory-schema-analyst

## L5 Prompts (10 total — all 9 required present)

audit-instructions, fix-instructions-drift, update-mapping, run-proof-pack, release-readiness, contradiction-resolution, simple-fast-session, heavy-runtime-session, ollama-dev-session, start-hybrid-memory-dispatch
