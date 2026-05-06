# TITANE∞ — Agent Effectiveness Policy

**Lock:** D0  
**Date:** 2026-05-06  
**Version:** 1.0  
**Contract:** `src/services/agent_effectiveness/AgentEffectivenessContract.ts` (v12 layer)  

---

## Core Principle

> Intelligence prouvée avant intelligence proclamée.

Agents must be measurable before they can claim authority. An agent without proof, scope, validators, and known limitations is INCOMPLETE regardless of its description.

---

## Policy 1 — NO_PROOF_NO_PASS

**ID:** AE-P1  
**Rule:** An agent cannot claim PASS verdict without both `proof_files` (non-empty) and `required_validators` (non-empty).  
**Consequence:** Agent is classified as `last_verdict: UNKNOWN` until proof and validators are declared.  
**Enforcement:** `canClaimPass(agent) === false` blocks PASS verdict.  
**Exception:** Governance/documentation-only agents (type: docs, type: e2e scaffolded) may use `last_verdict: NOT_RUN` until activated — but must still declare validators.

---

## Policy 2 — SCOPE_BOUNDARY_REQUIRED

**ID:** AE-P2  
**Rule:** Every agent must declare non-empty `allowed_scope` AND non-empty `forbidden_scope`.  
**Consequence:** Agent is INCOMPLETE. `detectAgentScopeDrift(agent)` returns true. `calculateAgentEffectiveness` penalizes -20 points.  
**Enforcement:** `AgentEffectivenessScorecardSchema` rejects empty arrays for these fields.  
**Rationale:** An agent without boundaries is unpredictable. Scope boundaries are not optional metadata — they are accountability contracts.

---

## Policy 3 — LIMITATIONS_MUST_BE_DECLARED

**ID:** AE-P3  
**Rule:** Every agent must declare at least one `known_limitation`. An agent claiming zero limitations must document its justification explicitly in a separate field (future D4 scope).  
**Consequence:** Agent with empty `known_limitations` fails schema validation. `summarizeAgentLimitations` returns `[NO_LIMITATIONS_DECLARED]`.  
**Enforcement:** `AgentEffectivenessScorecardSchema` enforces `.min(1)` on `known_limitations`.  
**Rationale:** No software agent has zero limitations. Claiming zero limitations is a red flag for incomplete analysis, not completeness.

---

## Policy 4 — FALSE_POSITIVE_FALSE_NEGATIVE_TRACKING

**ID:** AE-P4  
**Rule:** Every agent must declare `false_positive_count` (≥0) and `false_negative_count` (≥0). Zero is a valid value but must be declared explicitly.  
**Consequence:** Schema rejects negative values. Undeclared counts = INCOMPLETE scorecard.  
**Enforcement:** `AgentEffectivenessScorecardSchema` enforces `z.number().int().min(0)` on both fields.  
**Rationale:** Tracking false positives/negatives is the only empirical signal available before per-session performance logging exists. Starting at zero is honest; omitting the field is not.

---

## Policy 5 — RUNTIME_AUTHORITY_RISK

**ID:** AE-P5  
**Rule:** Any agent that has runtime authority (can execute, write, modify state, send IPC, or trigger external systems) must have `risk_level: high` or `risk_level: critical` unless formally proven otherwise.  
**Consequence:** Low/medium-risk tagging for runtime authority agents is a DRIFT condition. `RUNTIME_AUTHORITY_MINIMUM_RISK === 'high'` is the sentinel.  
**Enforcement:** Validator `verify_agent_effectiveness_scorecard.sh` checks agent type against risk level.  
**Rationale:** The cost of underestimating an agent's blast radius exceeds the cost of conservative tagging.

---

## Risk Level Matrix

| risk_level | Meaning |
|------------|---------|
| low | Documentation, read-only audit, passive analysis agents |
| medium | Validation agents with write access limited to reports/docs |
| high | Orchestration, IPC, filesystem write, test-autofix, release agents |
| critical | Agents that can modify production config, deploy artifacts, or grant permissions |

---

## Source Verifiability for Agent Claims

An agent claim (e.g., "architecture invariant violated") is:

- **SUPPORTED** — backed by validator output + proof file reference
- **UNSUPPORTED** — agent assertion without output evidence
- **HYPOTHESIS** — pattern detected, not confirmed, explicitly labeled
- **CONTRADICTED** — validator output contradicts the claim

Agent claims of type UNSUPPORTED or CONTRADICTED must NOT be presented as PASS verdicts.

---

## Effectiveness Calculation

| Penalty | Points |
|---------|--------|
| No proof_files | -25 |
| No required_validators | -20 |
| Scope drift (no allowed or no forbidden) | -20 |
| Missing known_limitations | -15 |
| Last verdict FAIL or BLOCKED | -20 |

Starting score: 100. Floor: 0.

---

## D0 Scope Boundaries

D0 is a **measurement layer only**. It does NOT:

- Implement agent self-correction (belongs to D4)
- Implement agent self-improvement (belongs to D4)
- Grant new runtime authority to any agent
- Enable autonomous agent execution
- Create a live feedback loop between agents

D0 adds: contracts, scorecards, validators, docs, registry entries, Desktop lane scaffolding, proof pack.

---

## Policy Violation Consequences

| Violation | Consequence |
|-----------|-------------|
| Agent claims PASS without proof | `BLOCKED_AGENT_PROOF` |
| Agent modifies forbidden scope | `BLOCKED_AGENT_AUTHORITY` |
| Scorecard missing limitations | Schema FAIL — agent is INCOMPLETE |
| False positive/negative fields missing | Schema FAIL — scorecard rejected |
| Scope boundary missing | `detectAgentScopeDrift` = true — agent INCOMPLETE |
| Registry contains UNKNOWN agent | `registry_complete = false` |
