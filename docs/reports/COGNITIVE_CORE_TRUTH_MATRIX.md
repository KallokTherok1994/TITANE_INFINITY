# TITANE∞ — Cognitive Core Truth Matrix

**Lock:** B1 — Cognitive Core Truth Matrix
**Version:** v1
**Date:** 2026-05-06
**Autopilot Session:** TITANE_INFINITY — ADVANCED INTELLIGENCE FULL PROGRAM AUTOPILOT v6
**Source Reference:** S010 PromptBench (prompt_instruction_governance), S004 LangSmith (llm_observability)
**Status:** BASELINE_ESTABLISHED

---

## Purpose

This matrix provides a structured, evidence-based view of TITANE's cognitive reasoning
pipeline integrity across six dimensions. Each dimension maps to verifiable runtime
signals in the TITANE codebase. This document serves as the baseline for Lock B1 and
the reference truth for scorecards `COGNITIVE_CORE_TRUTH_SCORECARD` and
`INTELLIGENCE_TRUTH_SCORECARD` (created Lock B0).

---

## Dimension Definitions

### Dimension 1 — Reasoning Traceability

**Definition:** Every response produced by TITANE must be traceable to a specific
pipeline stage, model dispatch decision, and intent classification result. No "magic
output" without an observable chain.

| Signal | Source | Current State | Gap |
|--------|--------|---------------|-----|
| `DetectedIntention` struct (primary_intent, confidence, complexity) | `src/core/pipelines/UnifiedCognitivePipeline.ts:55-70` | IMPLEMENTED — intent classification runs on every message | No cross-session trace persistence |
| `OmegaTraceMeta` IPC envelope field | `src/schemas/ipcTruthContracts.ts` | IMPLEMENTED — trace included in IPC response | Not always surfaced in UI |
| `PipelineStage` enum (router, merger, guardrails) | `src-tauri/src/omega/pipeline.rs` | IMPLEMENTED — stage-by-stage processing | Stage latencies not exported as metrics |
| `GuardrailResult.checks` array | `src-tauri/src/omega/guardrails.rs` | IMPLEMENTED — checks logged per response | Not accessible to eval harness |

**Current Truth Level:** PARTIAL — trace exists in IPC but is not fully surfaced for eval.
**Blocking for Champion Promotion:** YES (CC-01)

---

### Dimension 2 — Factual Grounding

**Definition:** TITANE must not produce responses that assert false facts as true.
Responses must be grounded in provided context, verified memory, or must explicitly
acknowledge uncertainty.

| Signal | Source | Current State | Gap |
|--------|--------|---------------|-----|
| `GuardrailResult.safety_score` (0.0–1.0) | `src-tauri/src/omega/guardrails.rs:45` | IMPLEMENTED — safety score computed per response | Threshold not tied to factual accuracy specifically |
| `was_modified / was_blocked` flags | `src-tauri/src/omega/guardrails.rs:40-44` | IMPLEMENTED — blocked responses tracked | Block reason not always specific enough for factual errors |
| IPC contract `{ ok, content, error }` | `src/schemas/ipcTruthContracts.ts` | ENFORCED — no silent failure allowed by contract | Cannot detect model hallucination at IPC level alone |
| `HONESTY_SCORECARD` dimensions AV-01–AV-08 | `evals/scorecards/v1/HONESTY_SCORECARD.json` | DEFINED — eval dimensions cover factual honesty | Champion at v28.0.0 (stale — 5 major versions) |

**Current Truth Level:** PARTIAL — grounding infrastructure exists; factual accuracy
validation is dependent on eval harness which is behind on champion.
**Blocking for Champion Promotion:** YES (CC-01, CC-02)

---

### Dimension 3 — Instruction Compliance

**Definition:** TITANE must obey the governance instruction layer order (L1→L6).
System prompts from higher layers must not be overridden by lower-layer inputs.
Instructions must propagate correctly from kernel to runtime without inversion.

| Signal | Source | Current State | Gap |
|--------|--------|---------------|-----|
| Layer priority enforcement | `.github/copilot-instructions.md` (L1) | ENFORCED — 6-layer canonical order defined | No automated runtime check on layer ordering |
| `verify_instructions.sh` gate | `scripts/verify_instructions.sh` | PASS=51 (current run) | Only checks file presence, not runtime propagation |
| `governance/layer_priority.yaml` | `governance/layer_priority.yaml` | PRESENT — formal IDs L1–L6 defined | Not read at runtime by conversation engine |
| OMEGA system prompt assembly | `src-tauri/src/omega/pipeline.rs` | Assembles prompt per conversation config | System prompt injection risk if config override allowed |
| PromptBench adversarial test (S010) | `evals/datasets/v1/lane_d_honesty.jsonl` | Dataset present (lane_d) | No dedicated adversarial instruction-override test cases |

**Current Truth Level:** PARTIAL — layer order is enforced at governance level;
runtime instruction compliance is not continuously validated with adversarial tests.
**Blocking for Champion Promotion:** YES (CC-03)

---

### Dimension 4 — Temporal Awareness

**Definition:** TITANE must not present stale knowledge as current. When retrieving
from memory or knowledge base, the temporal validity of facts must be respected.
Responses about current events must acknowledge knowledge cutoffs.

| Signal | Source | Current State | Gap |
|--------|--------|---------------|-----|
| `RESEARCH_TRUTH_SCORECARD` stub (RT-01 to RT-05) | `evals/scorecards/v1/RESEARCH_TRUTH_SCORECARD.json` | STUB — no champion yet | Champion eval required before blocking dims can be confirmed |
| Memory entry timestamps | `memory/memory_core_state.json` | PRESENT — memory entries have `updated_at` fields | No decay function applied to stale memory items |
| `knowledge_cutoff_acknowledged` (RT-02) | Scorecard stub | DEFINED — dimension exists | No current test exercises this path explicitly |
| Temporal QA reference (S008) | `docs/research/AI_ENGINEERING_SOURCE_MAP.md` | MAPPED — S008 cited | No integration test based on S008 methodology |

**Current Truth Level:** GAP — temporal awareness infrastructure is partially
present in memory timestamps but no decay, cutoff acknowledgment, or eval coverage.
**Blocking for Champion Promotion:** NO (non-blocking dims RT-04, RT-05; blocking dims RT-01–RT-03 require champion eval)

---

### Dimension 5 — Provider Honesty

**Definition:** TITANE must report the actual provider and model used for any
response. Fallbacks must be explicitly labeled. No lying fallback (reporting a
better model than was actually used).

| Signal | Source | Current State | Gap |
|--------|--------|---------------|-----|
| `ReasonCodeSchema` enum (CONTRACT_VIOLATION_CLAMPED, FALLBACK_OFFLINE, etc.) | `src/schemas/ipcTruthContracts.ts:20-40` | IMPLEMENTED — 19 reason codes including FALLBACK variants | FALLBACK_OFFLINE does not always include actual model used |
| `ProviderDecisionMeta` in IPC response | `src/schemas/ipcTruthContracts.ts` | IMPLEMENTED — provider decision included in response | Not surfaced to user in current UI build |
| `DEFAULT_OLLAMA_MODEL = "gemma2:2b"` | `src-tauri/src/ollama.rs` | ENFORCED — PROD model constant | `chat_orchestrator.rs` line 884 fallback = `llama3.1:latest` (KNOWN DRIFT) |
| `ROUTER_TRUTH_SCORECARD` | `evals/scorecards/v1/ROUTER_TRUTH_SCORECARD.json` | champion=v28.0.0 (stale) | eval re-run required to validate current routing truth |
| `PROVIDER_ROUTING_TRUTH_SCORECARD` stub (PR-01–PR-05) | `evals/scorecards/v1/PROVIDER_ROUTING_TRUTH_SCORECARD.json` | STUB — no champion yet | Champion eval required |

**Current Truth Level:** PARTIAL — provider honesty is defined contractually;
known drift: `chat_orchestrator.rs` fallback uses `llama3.1:latest` instead of
`gemma2:2b` (tracked in `docs/reports/VERSION_RELEASE_AUTHORITY_MATRIX.md`).
**Blocking for Champion Promotion:** YES (CC-02 — silent fallback without label)

---

### Dimension 6 — Context Coherence

**Definition:** TITANE must maintain coherent multi-turn context across a
conversation session. Prior user messages must be correctly recalled. Context
window boundaries must not silently truncate conversation history.

| Signal | Source | Current State | Gap |
|--------|--------|---------------|-----|
| `UserMessage` history in OMEGA pipeline | `src/core/pipelines/UnifiedCognitivePipeline.ts` | IMPLEMENTED — message history tracked in session | No explicit context window size enforcement in frontend |
| `requires_memory` flag in `DetectedIntention` | `src/core/pipelines/UnifiedCognitivePipeline.ts:67` | IMPLEMENTED — memory requirement flagged per turn | Flag outcome not logged for eval comparison |
| `context_window_not_silently_truncated` (CC-02) | `evals/scorecards/v1/COGNITIVE_CORE_TRUTH_SCORECARD.json` | STUB — no champion | No test proves silent truncation does not occur |
| `MEMORY_TRUTH_SCORECARD` | `evals/scorecards/v1/MEMORY_TRUTH_SCORECARD.json` | champion=v28.0.0 (stale) | eval re-run required |
| `MEMORY_RETRIEVAL_QUALITY_SCORECARD` stub (MR-01–MR-05) | `evals/scorecards/v1/MEMORY_RETRIEVAL_QUALITY_SCORECARD.json` | STUB — no champion | Champion eval required |

**Current Truth Level:** PARTIAL — context is tracked; truncation behavior is
not explicitly tested and memory scorecard champion is stale (v28.0.0).
**Blocking for Champion Promotion:** YES (CC-02)

---

## Summary Table

| # | Dimension | Truth Level | Blocking Gaps | Priority |
|---|-----------|-------------|---------------|----------|
| 1 | Reasoning Traceability | PARTIAL | Trace not in eval harness | HIGH |
| 2 | Factual Grounding | PARTIAL | Honesty champion stale (v28.0.0) | HIGH |
| 3 | Instruction Compliance | PARTIAL | No adversarial instruction test | MEDIUM |
| 4 | Temporal Awareness | GAP | No decay / cutoff enforcement | MEDIUM |
| 5 | Provider Honesty | PARTIAL | `chat_orchestrator.rs` fallback drift | CRITICAL |
| 6 | Context Coherence | PARTIAL | Truncation not explicitly tested | HIGH |

---

## Known Drifts

| Drift ID | Description | Source | Status |
|----------|-------------|--------|--------|
| CD-01 | `chat_orchestrator.rs` line 884: Ollama fallback = `llama3.1:latest` (should be `gemma2:2b`) | `src-tauri/src/chat_orchestrator.rs` | OPEN — tracked in VERSION_RELEASE_AUTHORITY_MATRIX |
| CD-02 | All 6 existing eval scorecards champion at v28.0.0 (delta = 5 major versions) | `evals/scorecards/v1/` | OPEN — B0 DRIFT_FOUND_FIXED stub phase; real eval run required |
| CD-03 | No dedicated adversarial instruction-override test cases in eval datasets | `evals/datasets/v1/lane_d_honesty.jsonl` | OPEN — deferred to eval harness expansion |
| CD-04 | Temporal decay function not implemented in memory pipeline | `memory/` | OPEN — deferred to C-series locks |
| CD-05 | `OmegaTraceMeta` exists in IPC contract but not surfaced in eval harness | `src/schemas/ipcTruthContracts.ts` | OPEN — deferred to B2 observability contract |

---

## Actionable Requirements for Next Locks

### B2 — Intelligence Observability Contract
- Expose `OmegaTraceMeta` and `GuardrailResult.checks` to eval harness
- Define trace schema: `session_id, model, prompt_hash, tokens, latency, feedback`
- Reference: S004 (LangSmith) trace fields

### C0 — Provider / Model Intelligence Routing
- Fix `chat_orchestrator.rs` line 884 fallback drift (CD-01)
- Enforce `TITANE_PROD_OLLAMA_MODEL = "gemma2:2b"` in all OMEGA fallback paths
- Reference: S009 (Mixtral MoE)

### D-series — Knowledge Freshness
- Implement temporal decay for memory entries
- Acknowledge knowledge cutoff in responses when applicable
- Reference: S008 (Temporal QA)

---

## Source References

| Source | ID | Relevance |
|--------|----|-----------|
| PromptBench | S010 | Adversarial instruction compliance testing methodology |
| LangSmith | S004 | Trace schema and observability field definitions |
| NIST AI RMF | S005 | Grounding requirements for AI factual outputs |
| Temporal QA | S008 | Knowledge freshness and staleness handling patterns |

---

*Generated by Lock B1 — Cognitive Core Truth Matrix (2026-05-06)*
*Governance: TITANE_INFINITY Advanced Intelligence Program v6*
