# TITANE_INFINITY Agent Decision Matrix

This matrix classifies active `.github/agents/*.agent.md` files. It is a reference artifact, not a merge or deletion plan.

| agent file | mission | keep/merge/prompt/archive/validator/unknown | authorized scope | forbidden scope | primary validator | prompt association | notes |
|---|---|---|---|---|---|---|---|
| `.github/agents/anti-regression-guardian.agent.md` | Anti-regression readiness and coverage | KEEP | regression validation | unknown | UNKNOWN | UNKNOWN | Active agent file; details inferred from name only. |
| `.github/agents/architect-guardian.agent.md` | Architecture invariants and layer safety | KEEP | architecture/checks | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/audit-subagent.agent.md` | Audit and review assistance | KEEP | audit-level review | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/dependency-guardian.agent.md` | Dependency compatibility and safety | KEEP | dependency management | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/docs-registry.agent.md` | Docs and registry mapping validation | KEEP | documentation and registry | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/e2e-authority.agent.md` | E2E deterministic execution authority | KEEP | E2E tests and artifacts | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/implement-subagent.agent.md` | TDD implementation support | KEEP | implementation guidance | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-architecture-master.agent.md` | Hybrid memory architecture governance | KEEP | memory architecture | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-backend-master.agent.md` | Hybrid memory backend execution | KEEP | memory backend | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-explainability-analyst.agent.md` | Memory explainability and traceability | KEEP | explainability | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-frontend-master.agent.md` | Memory frontend rollout and safety | KEEP | frontend memory surfaces | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-graph-relations.agent.md` | Graph relations and scoring | KEEP | memory graph relations | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-migration-analyst.agent.md` | Memory migration planning | KEEP | migration planning | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-orchestrator.agent.md` | Memory orchestration sequencing | KEEP | memory orchestration | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-qa-ops-master.agent.md` | Memory QA ops and proof validation | KEEP | QA/proof validation | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-regression-authority.agent.md` | Memory regression risk verification | KEEP | regression verification | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-release-validator.agent.md` | Memory release readiness validation | KEEP | release validation | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-root-commander.agent.md` | Hybrid memory rollout command | KEEP | rollout coordination | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/memory-schema-analyst.agent.md` | Data schema and consistency analysis | KEEP | schema design | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/ollama-dev-chat-boundary.agent.md` | Ollama Dev / Chat boundary guardian | KEEP | Ollama boundary governance | model contamination | verify:ollama:boundary | UNKNOWN | Active agent file; known validator association. |
| `.github/agents/release-proof.agent.md` | Release readiness and evidence proof | KEEP | release proof | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/review-subagent.agent.md` | Code review and remediation support | KEEP | review assistance | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/tauri-safety.agent.md` | Tauri capability and IPC safety | KEEP | src-tauri and Tauri config | unproven capability | verify:tauri-only | UNKNOWN | Active agent file; known validator association. |
| `.github/agents/temporal-modules.agent.md` | Temporal modules governance | KEEP | temporal module stack | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/test-autofix.agent.md` | Test failure classification and fix | KEEP | test autorepair | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/titane-conductor.agent.md` | Main TITANE governance orchestration | KEEP | cross-ring governance | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |
| `.github/agents/tool-selector-panel.agent.md` | Tool selector panel QA and integration | KEEP | UI tool registry | unknown | UNKNOWN | UNKNOWN | Active agent file; inferred from name. |

> Note: entries were populated from `.github/agents/*.agent.md` filenames and available metadata. Values marked `UNKNOWN` are conservatively left unspecified when safe inference was not available.
