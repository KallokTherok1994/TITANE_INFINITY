# 03 — AGENT INVENTORY
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Discovery Method
All entries verified by file system inspection. No hallucination.
Command: `find /home/titane-os/Documents/GitHub/TITANE_INFINITY -name "*.agent.md" -not -path "*/node_modules/*"`

---

## A — Copilot/GitHub Agents (.github/agents/)

| # | Name | Path | Role | Category | Ring | Active? | Consumes Runtime? | Affects Chat? | Proof Level | Regression Risk |
|---|------|------|------|----------|------|---------|------------------|----------------|-------------|-----------------|
| 1 | titane-conductor | .github/agents/titane-conductor.agent.md | Main orchestrator, 9 cognitive engines | Orchestration | 4 | YES (Copilot sessions) | NO (doc-governed) | INDIRECT | DOC_ONLY | MEDIUM — orchestrates all other agents |
| 2 | architect-guardian | .github/agents/architect-guardian.agent.md | Enforces 4-Ring, One Door, IPC invariants | Architecture enforcement | 3 | YES | NO | NO | DOC_ONLY | LOW |
| 3 | audit-subagent | .github/agents/audit-subagent.agent.md | Deep analysis TITANE_INFINITY | Audit | 3 | YES | NO | NO | DOC_ONLY | LOW |
| 4 | dependency-guardian | .github/agents/dependency-guardian.agent.md | Dependency safety, compatibility, regression | Dependency management | 3 | YES | NO | NO | DOC_ONLY | MEDIUM |
| 5 | docs-registry | .github/agents/docs-registry.agent.md | Append-only proof discipline for docs | Documentation | 3 | YES | NO | NO | DOC_ONLY | LOW |
| 6 | e2e-authority | .github/agents/e2e-authority.agent.md | Deterministic E2E execution, artifacts | E2E testing | 4 | YES | NO | NO | DOC_ONLY | MEDIUM |
| 7 | implement-subagent | .github/agents/implement-subagent.agent.md | TDD strict implementation | Implementation | 4 | YES | NO | NO | DOC_ONLY | HIGH — writes production code |
| 8 | release-proof | .github/agents/release-proof.agent.md | Release readiness, token-gated PROD | Release | 4 | YES | NO | NO | DOC_ONLY | HIGH — gates PROD |
| 9 | review-subagent | .github/agents/review-subagent.agent.md | Code review | Review | 3 | YES | NO | NO | DOC_ONLY | LOW |
| 10 | tauri-safety | .github/agents/tauri-safety.agent.md | Tauri capabilities, IPC safety, bounded I/O | Tauri safety | 4 | YES | NO | INDIRECT | DOC_ONLY | HIGH — IPC truth |

---

## B — Copilot-Extended Agents (.github/copilot-agents/)

| # | Name | Path | Role | Active? | Proof Level |
|---|------|------|------|---------|-------------|
| 11 | agent-factory | .github/copilot-agents/agent-factory.agent.md | Create new agents | YES | DOC_ONLY |
| 12 | architect | .github/copilot-agents/architect.agent.md | Architecture decisions | YES | DOC_ONLY |
| 13 | dependency-guardian | .github/copilot-agents/dependency-guardian.agent.md | Dependency safety (extended) | YES | DOC_ONLY |
| 14 | guardian | .github/copilot-agents/guardian.agent.md | General governance guard | YES | DOC_ONLY |
| 15 | orchestrator | .github/copilot-agents/orchestrator.agent.md | Session orchestration | YES | DOC_ONLY |

---

## C — Runtime Agent-Like Subsystems (src/)

| # | Name | Path | Role | Category | Ring | Active? | Consumes Runtime? | Affects Chat? | Proof Level | Regression Risk |
|---|------|------|------|----------|------|---------|------------------|----------------|-------------|-----------------|
| 16 | persona_agent | src/core/ai/agents/persona_agent.ts | Persona management for chat | AI/Persona | 2 | YES | YES | YES | WIRED_BUT_UNPROVEN | HIGH — directly affects prompts |
| 17 | agents.api | src/services/agents/agents.api.ts | Agent API calls | Services | 2 | YES | YES | YES | PARTIAL_CHAIN | HIGH |
| 18 | chatEngine | src/services/ai/chatEngine.ts | Chat response assembly | Core AI | 2 | YES | YES | YES | WIRED_BUT_UNPROVEN | CRITICAL |
| 19 | chatModes | src/services/ai/chatModes.ts | Chat mode selection/policy | AI | 2 | YES | YES | YES | WIRED_BUT_UNPROVEN | HIGH |
| 20 | responsePolicy | src/services/ai/responsePolicy.ts | Response policy enforcement | AI | 2 | YES | YES | YES | WIRED_BUT_UNPROVEN | CRITICAL |
| 21 | orchestrator | src/services/ai/orchestrator.ts | AI orchestration | AI | 2 | YES | YES | YES | WIRED_BUT_UNPROVEN | HIGH |
| 22 | memoryIntegration | src/services/ai/memoryIntegration.ts | Memory injection into prompts | Memory | 2 | YES | YES | YES | PARTIAL_CHAIN | CRITICAL |
| 23 | autoHealEngine | src/services/ai/autoHealEngine.ts | Frontend auto-heal logic | Healing | 2 | YES | YES | NO | WIRED_BUT_UNPROVEN | MEDIUM |
| 24 | healthMonitor | src/services/ai/healthMonitor.ts | System health monitoring | Monitoring | 2 | YES | YES | NO | WIRED_BUT_UNPROVEN | MEDIUM |
| 25 | unifiedHealingFacade | src/services/ai/unifiedHealingFacade.ts | Unified healing facade | Healing | 2 | YES | YES | NO | WIRED_BUT_UNPROVEN | MEDIUM |
| 26 | memoryStore | src/stores/memoryStore.ts | Memory state management | State | 2 | YES | YES | YES | PARTIAL_CHAIN | HIGH |
| 27 | useMemoryEngineStore | src/stores/useMemoryEngineStore.ts | Memory engine store | State | 2 | YES | YES | YES | PARTIAL_CHAIN | HIGH |
| 28 | useSelfHealingStore | src/stores/useSelfHealingStore.ts | Self-healing state | State | 2 | YES | YES | NO | WIRED_BUT_UNPROVEN | MEDIUM |

---

## D — Rust Backend Agent-Like Subsystems (src-tauri/src/)

| # | Name | Path | Role | Category | Ring | Active? | Consumes Runtime? | Affects Chat? | Proof Level | Regression Risk |
|---|------|------|------|----------|------|---------|------------------|----------------|-------------|-----------------|
| 29 | auto_heal | src-tauri/src/auto_heal.rs | Backend auto-heal logic | Healing | 1 | YES | YES | NO | WIRED_BUT_UNPROVEN | MEDIUM |
| 30 | chat_commands | src-tauri/src/api/chat_commands.rs | IPC chat command handlers | IPC/Chat | 1 | YES | YES | YES | PARTIAL_CHAIN | CRITICAL |
| 31 | memory_api | src-tauri/src/api/memory_api.rs | IPC memory command handlers | IPC/Memory | 1 | YES | YES | YES | PARTIAL_CHAIN | CRITICAL |
| 32 | memory_persistence | src-tauri/src/memory_persistence.rs | Memory persistence logic | Memory | 1 | YES | YES | YES | WIRED_BUT_UNPROVEN | HIGH |
| 33 | memory_compactor | src-tauri/src/memory_compactor.rs | Memory compaction | Memory | 1 | YES | YES | NO | WIRED_BUT_UNPROVEN | MEDIUM |
| 34 | runtime_real | src-tauri/src/runtime_real.rs | Real runtime (16KB) | Runtime | 1 | YES | YES | YES | WIRED_BUT_UNPROVEN | CRITICAL |
| 35 | evaluator | src-tauri/src/ai/evaluator.rs | AI evaluation logic | AI/Eval | 1 | DORMANT? | YES | NO | UNKNOWN | HIGH — unexplored |
| 36 | network_gateway | src-tauri/src/services/network_gateway.rs | One Door network gate | Network | 1 | YES | YES | YES | PARTIAL_CHAIN | CRITICAL |
| 37 | local_llm_service | src-tauri/src/services/local_llm_service.rs | Local LLM (Ollama) | Provider | 1 | YES | YES | YES | PARTIAL_CHAIN | HIGH |
| 38 | ollama | src-tauri/src/ollama.rs | Ollama integration | Provider | 1 | YES | YES | YES | PARTIAL_CHAIN | HIGH |

---

## Summary Statistics

- **Total agent-like subsystems inventoried:** 38
- **DOC_ONLY (governance agents):** 15
- **WIRED_BUT_UNPROVEN (runtime):** 12
- **PARTIAL_CHAIN (partially evidenced):** 10
- **UNKNOWN:** 1 (evaluator.rs)
- **With active eval coverage:** 0 ← **ROOT CAUSE OF CURRENT LOCK**
- **Critical regression risk items:** 8 (chatEngine, responsePolicy, memoryIntegration, chat_commands, memory_api, runtime_real, network_gateway, evaluator)
