# TITANE∞ — Agent Effectiveness Scorecard

**Lock:** D0  
**Date:** 2026-05-06  
**Version:** 1.0  
**Governance:** Lock D0 — Agent Effectiveness System  
**Contract:** `src/services/agent_effectiveness/AgentEffectivenessContract.ts` (v12 layer)  

---

## Invariants

- An agent CANNOT claim PASS without `required_validators` and `proof_files`.
- An agent with no `known_limitations` is INCOMPLETE.
- An agent with no `allowed_scope` or `forbidden_scope` is INCOMPLETE.
- An agent with no `trigger_conditions` is INCOMPLETE.
- `false_positive_count` and `false_negative_count` MUST be declared (may be 0).
- Runtime-authority agents MUST have `risk_level: high` or `critical`.
- D0 does NOT grant new runtime authority. D0 is a measurement layer only.

---

## Agent Inventory

| agent_id | agent_name | agent_type | status | last_verdict | risk_level | proof_linked |
|----------|------------|------------|--------|--------------|------------|--------------|
| architect-guardian | Architect Guardian | guardian | ACTIVE | NOT_RUN | high | No — no D0 proof pack yet |
| anti-regression-guardian | Anti-Regression Guardian | guardian | ACTIVE | NOT_RUN | high | No |
| audit-subagent | Audit Subagent | validator | ACTIVE | NOT_RUN | medium | No |
| dependency-guardian | Dependency Guardian | guardian | ACTIVE | NOT_RUN | high | No |
| docs-registry | Docs Registry | docs | ACTIVE | NOT_RUN | low | No |
| e2e-authority | E2E Authority | e2e | ACTIVE | NOT_RUN | medium | No |
| implement-subagent | Implement Subagent | runtime | ACTIVE | NOT_RUN | high | No |
| memory-architecture-master | Memory Architecture Master | memory | PASSIVE | NOT_RUN | high | No |
| memory-backend-master | Memory Backend Master | memory | PASSIVE | NOT_RUN | high | No |
| memory-explainability-analyst | Memory Explainability Analyst | memory | PASSIVE | NOT_RUN | medium | No |
| memory-frontend-master | Memory Frontend Master | memory | PASSIVE | NOT_RUN | medium | No |
| memory-graph-relations | Memory Graph Relations | memory | PASSIVE | NOT_RUN | medium | No |
| memory-migration-analyst | Memory Migration Analyst | memory | PASSIVE | NOT_RUN | high | No |
| memory-orchestrator | Memory Orchestrator | orchestrator | PASSIVE | NOT_RUN | high | No |
| memory-qa-ops-master | Memory QA Ops Master | memory | PASSIVE | NOT_RUN | medium | No |
| memory-regression-authority | Memory Regression Authority | memory | ACTIVE | NOT_RUN | high | No |
| memory-release-validator | Memory Release Validator | release | PASSIVE | NOT_RUN | high | No |
| memory-root-commander | Memory Root Commander | orchestrator | PASSIVE | NOT_RUN | high | No |
| memory-schema-analyst | Memory Schema Analyst | memory | PASSIVE | NOT_RUN | medium | No |
| ollama-dev-chat-boundary | Ollama Dev/Chat Boundary Guardian | guardian | ACTIVE | NOT_RUN | high | No |
| release-proof | Release Proof | release | ACTIVE | NOT_RUN | high | No |
| review-subagent | Review Subagent | validator | ACTIVE | NOT_RUN | medium | No |
| tauri-safety | Tauri Safety | guardian | ACTIVE | NOT_RUN | high | No |
| test-autofix | Test Autofix | validator | ACTIVE | NOT_RUN | high | No |
| titane-conductor | Titane Conductor | orchestrator | ACTIVE | NOT_RUN | high | No |
| tool-selector-panel | Tool Selector Panel | e2e | ACTIVE | NOT_RUN | medium | No |

---

## Agent Detail Scorecards

### architect-guardian

| Field | Value |
|-------|-------|
| agent_id | architect-guardian |
| agent_type | guardian |
| mission | Enforce 4-Ring, One Door, and IPC architecture invariants |
| trigger_conditions | New IPC command; Ring boundary crossed; One Door bypass; capability/allowlist change |
| allowed_scope | `src-tauri/src/`, `src/lib/security.ts`, `docs/IPC_CATALOG.md`, `ARCHITECTURE.md` |
| forbidden_scope | `memory/`, `deployment/`, `data/knowledge_base/default/`, `src-tauri/src/omega/`, `src-tauri/src/singularity/` |
| required_validators | `verify_instructions.sh`, `detect_recurrence.sh` |
| proof_files | N/A — agent is a governance role, not a task with proof pack |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Does not inspect dynamic imports; cannot detect Ring violations in generated code at build-time; relies on human review for indirect cross-ring dependencies |
| risk_level | high |
| rollback_expectation | `git restore src-tauri/src/` + revert IPC registration |
| next_gap | Add dynamic import scan to verify_instructions.sh |

---

### anti-regression-guardian

| Field | Value |
|-------|-------|
| agent_id | anti-regression-guardian |
| agent_type | guardian |
| mission | Audit anti-regression readiness, canonical surface proof coverage, mapping drift, and bounded remediation paths |
| trigger_conditions | Any `src/`, `src-tauri/`, `tests/`, `e2e/`, `scripts/` mutation; AutoHeal diff |
| allowed_scope | `scripts/autoheal/`, `docs/registry/`, `tests/`, `e2e/`, `proof_packs/` |
| forbidden_scope | `memory/memory_core_state.json`, `memory/stm.json`, `data/knowledge_base/default/` |
| required_validators | `detect_recurrence.sh`, `verify_instructions.sh` |
| proof_files | `scripts/autoheal/autoheal_rules.jsonl` (append evidence per session) |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Cannot detect regressions in Rust code that pass `cargo test` but introduce behavioral drift; does not scan WASM artifacts |
| risk_level | high |
| rollback_expectation | Revert the failing AutoHeal entry; re-run detect_recurrence |
| next_gap | Add Rust behavioral drift scan |

---

### tauri-safety

| Field | Value |
|-------|-------|
| agent_id | tauri-safety |
| agent_type | guardian |
| mission | Enforce Tauri capabilities, allowlist, IPC safety, and bounded I/O |
| trigger_conditions | Tauri capability change; new IPC command; allowlist mutation; file system scope extension |
| allowed_scope | `src-tauri/`, `tauri*.json`, `runtime/` |
| forbidden_scope | `src/`, `memory/`, `deployment/`, `dist/` (except reading) |
| required_validators | `verify_instructions.sh`, `detect_recurrence.sh` |
| proof_files | N/A — governance role |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Cannot audit third-party Tauri plugins; does not scan CSP headers in runtime WebView; limited visibility into Rust macro-generated IPC surface |
| risk_level | high |
| rollback_expectation | `git restore src-tauri/tauri.conf.json` + revert capability changes |
| next_gap | Add CSP header audit to capability review |

---

### ollama-dev-chat-boundary

| Field | Value |
|-------|-------|
| agent_id | ollama-dev-chat-boundary |
| agent_type | guardian |
| mission | Guard the boundary between Ollama Dev (VSCode Copilot / qwen3.5:9b) and Ollama Chat (TITANE runtime / gemma2:2b) |
| trigger_conditions | Model default change; MCP config change; OLLAMA_MODEL env var set; chat orchestrator model fallback change |
| allowed_scope | `.vscode/mcp.json`, `scripts/verify/verify-ollama-copilot-boundary.sh`, `OLLAMA_RUNTIME_MAP.md`, `src-tauri/src/ai/ollama.rs`, `src-tauri/src/ollama.rs` |
| forbidden_scope | `src-tauri/src/omega/`, `memory/`, `deployment/` |
| required_validators | `pnpm run verify:ollama:boundary`, `detect_recurrence.sh` |
| proof_files | N/A — governance role |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Cannot detect contamination through environment variable inheritance at OS boot; does not audit Android build defaults separately from desktop |
| risk_level | high |
| rollback_expectation | Reset OLLAMA_DEFAULT_MODEL to gemma2:2b; restore MCP config to qwen3.5:9b; rerun boundary validator |
| next_gap | Add Android build model audit |

---

### titane-conductor

| Field | Value |
|-------|-------|
| agent_id | titane-conductor |
| agent_type | orchestrator |
| mission | Orchestrate all TITANE_INFINITY agents, enforce Ring 0-4 workflow, 4-phases (diagnose→plan→apply→verify→report), escalate BLOCKED_DOCTRINE |
| trigger_conditions | Cross-ring task; BLOCKED_DOCTRINE escalation; session start; BUILD ALL command |
| allowed_scope | All repo paths (orchestration role); writes to `docs/`, `proof_packs/`, `reports/` |
| forbidden_scope | `memory/memory_core_state.json`, `memory/stm.json` (never stage); direct DB writes; credentials in session notes |
| required_validators | `verify_instructions.sh`, `detect_recurrence.sh`, all relevant lock validators |
| proof_files | Each governed session produces a proof pack |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Cannot enforce rollback autonomously — requires human confirmation for destructive actions; orchestration scope is documented intent, not enforced at shell level |
| risk_level | high |
| rollback_expectation | Revert committed phase using `git revert`; restore pre-session proof pack state |
| next_gap | Add automated phase-commit gate enforcement |

---

### e2e-authority

| Field | Value |
|-------|-------|
| agent_id | e2e-authority |
| agent_type | e2e |
| mission | Enforce deterministic E2E execution and required artifacts (screenshots, logs, selectors) |
| trigger_conditions | New user-facing feature; route change; UI surface change; Playwright spec merge |
| allowed_scope | `e2e/`, `playwright.config.ts`, `playwright-report/`, `playwright.global-setup.ts` |
| forbidden_scope | `src-tauri/`, `memory/`, `deployment/`, `data/knowledge_base/default/` |
| required_validators | `pnpm run test:e2e`, Playwright report artifacts |
| proof_files | `playwright-report/` (per-run); `e2e/` spec files |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Cannot run E2E against production Tauri builds without full AppImage smoke; desktop E2E requires running Tauri dev server; mobile E2E requires physical device or emulator |
| risk_level | medium |
| rollback_expectation | Revert spec changes; delete stale screenshots |
| next_gap | Add headless smoke for all advanced intelligence lanes |

---

### release-proof

| Field | Value |
|-------|-------|
| agent_id | release-proof |
| agent_type | release |
| mission | Evaluate release readiness with strict evidence (no token gate required) |
| trigger_conditions | Version bump; BUILD ALL command; AppImage/DEB/APK artifact created |
| allowed_scope | `deployment/`, `release/`, `RELEASE_SURFACE_INVENTORY.md`, `RELEASE_ARTIFACTS_CHECKSUMS*.txt`, `scripts/post-build/` |
| forbidden_scope | `src/`, `src-tauri/src/`, `memory/`, `data/knowledge_base/default/` |
| required_validators | `scripts/post-build/update-desktop-icons.sh`, checksum verification, artifact smoke |
| proof_files | `RELEASE_ARTIFACTS_CHECKSUMS*.txt`, `proof_packs/V*/` |
| last_verdict | NOT_RUN |
| false_positive_count | 0 |
| false_negative_count | 0 |
| known_limitations | Cannot validate Windows MSI on Linux without cross-compile; Android APK install validation requires physical device; icon cache refresh has known timing issues on some GNOME shell versions |
| risk_level | high |
| rollback_expectation | Restore previous deployment artifact; re-run post-build script; revert version bump |
| next_gap | Add checksum cross-validation in CI pipeline |

---

## Summary

| Total | ACTIVE | PASSIVE | NOT_RUN | Proof-linked | Missing limitations |
|-------|--------|---------|---------|--------------|---------------------|
| 26 | 14 | 12 | 26 | 0 (D0 is first measurement pass) | 0 |

**Registry complete:** NO — D0 is the first scorecard pass. All agents have NOT_RUN verdicts. Proof-linking is the D1 / D2 gap.

**Next gap:** Link each agent's proof_files to actual proof pack references once per-agent lock executions occur.
