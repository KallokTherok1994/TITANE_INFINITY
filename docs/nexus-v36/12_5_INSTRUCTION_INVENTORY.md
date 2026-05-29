# GATE 12.5 — INSTRUCTION INVENTORY

**Date:** 2026-05-29

---

## L1 Kernel

| File | Lines | Last Updated | NEXUS Content |
|------|-------|-------------|---------------|
| `.github/copilot-instructions.md` | 276 | 2026-05-29 | NEXUS v36/v37 Governance section (added Gate 12.5) |

## L2 Path-Scoped

| File | Scope | Lines | NEXUS Content |
|------|-------|-------|---------------|
| `.github/instructions/titane.instructions.md` | `src/**, src-tauri/**, tests/**, scripts/**` | 101 | None (kernel points to docs/nexus-v36) |
| `.claude/rules/frontend-runtime.md` | `src/**` | ~40 | None |

## L3 Agent OS

| File | Lines | Notes |
|------|-------|-------|
| `AGENTS.md` | 207 | Agent OS index; no NEXUS gate content |

## L4 Custom Agents

| Agent | File | Status |
|-------|------|--------|
| pre-build-certifier | `.github/agents/pre-build-certifier.agent.md` | Active |
| titane-dev agents | `.titane-dev/agents/**` | Active (created Gate 4) |

## .titane-dev/memory Files

| File | Status | Last Updated |
|------|--------|-------------|
| `nexus_phase_lock.md` | UPDATED | 2026-05-29 — reflects POST_GATE_14 state |
| `decisions.md` | Active | — |
| `forbidden_actions.md` | Active | — |
| `model_map.md` | Active | — |
| `project_context.md` | Active | — |
| `runtime_taxonomy.md` | Active | — |
| `surface_truth_taxonomy.md` | Active | — |
| `windows_first_policy.md` | Active | — |

## Pre-existing Validator FAILs (not new)

| Validator | Status | Notes |
|-----------|--------|-------|
| G_VSCODE_AGENT_WORKFLOW_PASS | PRE-EXISTING FAIL | Pre-dates Gate 12.5 |
| G_MCP_SECURITY_BOUNDARY_PASS | PRE-EXISTING FAIL | Pre-dates Gate 12.5 |
| G_OLLAMA_BOUNDARY_PASS | PRE-EXISTING FAIL | Pre-dates Gate 12.5 |
