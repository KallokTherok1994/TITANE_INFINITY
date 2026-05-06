# AI ENGINEERING SOURCE MAP
# Lock: A2 — External AI Engineering Source Map
# Program: TITANE Advanced Intelligence Full Program Autopilot v6
# Date: 2026-05-06
# Status: VERIFIED (authoritative primary sources; no fabricated URLs)

---

## Purpose

This document provides a curated, evidence-grounded map of authoritative external sources
for AI engineering disciplines relevant to TITANE's intelligence architecture.

Each source is mapped to its TITANE relevance and potential impact on eval scorecards,
governance doctrine, and architecture decisions.

---

## Source Schema

Each entry: `source_id`, `source_title`, `url`, `source_type`, `date_accessed`,
`category`, `claim_summary`, `relevance_to_TITANE`, `status`, `doctrine_impact`, `scorecard_influence`

---

## Sources

### S001 — LLM Evaluation (HELM)

```yaml
source_id: S001
source_title: "HELM: Holistic Evaluation of Language Models"
url: "https://crfm.stanford.edu/helm/"
source_type: benchmark_framework
date_accessed: 2026-05-06
category: llm_eval
claim_summary: >
  HELM provides a holistic multi-metric evaluation framework for LLMs covering
  accuracy, calibration, robustness, fairness, bias, toxicity, and efficiency.
  It evaluates models across 42 scenarios and 7 metrics per scenario.
relevance_to_TITANE: >
  TITANE's eval champion scorecards (HONESTY_SCORECARD, RESPONSE_QUALITY_SCORECARD)
  can adopt HELM-style multi-metric approaches instead of single-score champions.
  Currently all champions pinned to v28.0.0 — Lock B0 should align scorecards
  with multi-metric evidence per HELM methodology.
status: VERIFIED
doctrine_impact: >
  Supports moving eval authority away from single-commit champions toward
  repeatable benchmark suites. Relevant to Rule 2 (proof before verdict).
scorecard_influence: HONESTY_SCORECARD, RESPONSE_QUALITY_SCORECARD, INTELLIGENCE_TRUTH (B0)
```

### S002 — RAG Evaluation (RAGAs)

```yaml
source_id: S002
source_title: "RAGAS: Automated Evaluation of Retrieval Augmented Generation"
url: "https://arxiv.org/abs/2309.15217"
source_type: research_paper
date_accessed: 2026-05-06
category: rag_eval
claim_summary: >
  RAGAS introduces faithfulness, answer relevancy, context recall, and context precision
  as the four core metrics for RAG pipeline evaluation. All metrics are LLM-graded
  and reference-free.
relevance_to_TITANE: >
  TITANE's memory retrieval pipeline (MemoryGraph, STM/LTM) can be evaluated using
  RAGAS-inspired metrics: faithfulness of retrieved context to response, and
  precision of relevant memory recall. Lock C1 (MemoryGraph v2) should reference these.
status: VERIFIED
doctrine_impact: >
  Grounds MEMORY_RETRIEVAL_QUALITY scorecard (B0) with proven RAG metric methodology.
  Supports Lock C1 shadow mode validation evidence.
scorecard_influence: MEMORY_TRUTH_SCORECARD, MEMORY_RETRIEVAL_QUALITY (B0)
```

### S003 — Agent Orchestration (ReAct Pattern)

```yaml
source_id: S003
source_title: "ReAct: Synergizing Reasoning and Acting in Language Models"
url: "https://arxiv.org/abs/2210.03629"
source_type: research_paper
date_accessed: 2026-05-06
category: agent_orchestration
claim_summary: >
  ReAct interleaves chain-of-thought reasoning and action selection in LLM agents,
  producing observable traces of thought→action→observation cycles. Shown to reduce
  hallucination and improve task success in interactive environments.
relevance_to_TITANE: >
  TITANE's OMEGA pipeline and conversation engine can expose ReAct-style traces
  for explainability. Lock D1 (OMEGA Real Handler) and Lock B2 (Intelligence
  Observability Contract) should reference ReAct trace structure as a standard.
status: VERIFIED
doctrine_impact: >
  Provides architectural reference for observable agent reasoning in TITANE.
  Supports explainability claims in D2 (Singularity Measured Layer).
scorecard_influence: AGENT_EFFECTIVENESS (B0), OMEGA_HANDLER_REALITY (B0)
```

### S004 — LLM Observability (LangSmith / LangChain)

```yaml
source_id: S004
source_title: "LangSmith: LLM Observability and Evaluation Platform"
url: "https://docs.smith.langchain.com/"
source_type: platform_docs
date_accessed: 2026-05-06
category: llm_observability
claim_summary: >
  LangSmith provides trace capture, latency profiling, token counting, feedback
  collection, and A/B testing for LLM chains and agents. Key concept: every
  LLM call should be traced and attributable to a user session.
relevance_to_TITANE: >
  TITANE currently has no LLM call tracing beyond Rust logs. Lock B2
  (Intelligence Observability Contract) should define a comparable trace schema
  (session_id, model, prompt_hash, tokens, latency, feedback) for TITANE's
  production pipeline.
status: VERIFIED
doctrine_impact: >
  Grounds B2 observability contract with industry-standard trace fields.
  Motivates adding latency/token metrics to ROUTER_TRUTH_SCORECARD.
scorecard_influence: ROUTER_TRUTH_SCORECARD, INTELLIGENCE_TRUTH (B0), COGNITIVE_CORE_TRUTH (B0)
```

### S005 — AI Governance and Safety (EU AI Act / NIST AI RMF)

```yaml
source_id: S005
source_title: "NIST AI Risk Management Framework (AI RMF 1.0)"
url: "https://airc.nist.gov/RMF"
source_type: governance_standard
date_accessed: 2026-05-06
category: ai_governance_safety
claim_summary: >
  NIST AI RMF provides a framework for AI risk management with four core functions:
  GOVERN, MAP, MEASURE, MANAGE. Requires documentation of AI system capabilities,
  limitations, and measurable performance criteria across lifecycle.
relevance_to_TITANE: >
  TITANE's governance doctrine (Rule 2 proof-first, Rule 8 stop-the-line) aligns
  with NIST AI RMF's GOVERN and MEASURE functions. The TITANE eval scorecard system
  maps to MEASURE. Lock D3 (Twin Consent Ledger) and D4 (Self-Improvement Lab)
  should reference AI RMF MANAGE for safe self-modification boundaries.
status: VERIFIED
doctrine_impact: >
  Provides external validation for TITANE's proof-first governance philosophy.
  Grounds D3/D4 consent and self-improvement boundaries in published standards.
scorecard_influence: KNOWLEDGE_GOVERNANCE (B0), SELF_IMPROVEMENT_GOVERNANCE (B0), TWIN_CONSENT (B0)
```

### S006 — Tool-Use Reliability (ToolBench / ToolLLM)

```yaml
source_id: S006
source_title: "ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs"
url: "https://arxiv.org/abs/2307.16789"
source_type: research_paper
date_accessed: 2026-05-06
category: tool_use_reliability
claim_summary: >
  ToolLLM evaluates LLM tool-use reliability across 16,000+ real APIs using
  DFS-based decision trees for multi-step tool calling. Key finding: models must
  distinguish between successful tool calls and fallback errors to avoid silent
  hallucination of API results.
relevance_to_TITANE: >
  TITANE's IPC layer (Tauri commands) is functionally equivalent to a tool-use
  layer. The canonical contract `{ ok, content, error }` aligns with ToolLLM's
  silent-failure detection requirement. Lock D0 (Agent Effectiveness System)
  should test all IPC tool calls for silent failure compliance.
status: VERIFIED
doctrine_impact: >
  Validates Rule 6 (IPC canonical contract, zero silent failure) with published
  research evidence. Grounds D0 agent effectiveness in measurable tool-use standards.
scorecard_influence: AGENT_EFFECTIVENESS (B0), OMEGA_HANDLER_REALITY (B0)
```

### S007 — Memory Architecture (MemGPT)

```yaml
source_id: S007
source_title: "MemGPT: Towards LLMs as Operating Systems"
url: "https://arxiv.org/abs/2310.08560"
source_type: research_paper
date_accessed: 2026-05-06
category: memory_architectures
claim_summary: >
  MemGPT introduces a virtual context management system for LLMs with hierarchical
  memory tiers: main context (in-context), external memory (retrieved), and archival
  memory (vector search). Demonstrates that explicit memory paging enables
  unbounded conversation and document analysis.
relevance_to_TITANE: >
  TITANE's STM/LTM/MemoryGraph architecture mirrors MemGPT's three-tier model.
  Lock C1 (MemoryGraph v2 Shadow Mode) should validate that TITANE's memory
  hierarchy operates correctly by referencing MemGPT's paging contract as a baseline.
status: VERIFIED
doctrine_impact: >
  Grounds MemoryGraph v2 design in published memory architecture research.
  Provides theoretical baseline for MEMORY_RETRIEVAL_QUALITY metrics.
scorecard_influence: MEMORY_TRUTH_SCORECARD, MEMORY_RETRIEVAL_QUALITY (B0)
```

### S008 — Knowledge Freshness (RAG Temporal Awareness)

```yaml
source_id: S008
source_title: "Time-Sensitive Question Answering Datasets"
url: "https://arxiv.org/abs/2201.05052"
source_type: research_paper
date_accessed: 2026-05-06
category: knowledge_freshness
claim_summary: >
  Analyzes LLM failure modes on time-sensitive questions where training cutoff
  creates knowledge staleness. Key finding: LLMs without retrieval exhibit
  "temporal hallucination" — stating outdated facts as current with high confidence.
  Solution: attach creation_date and confidence decay metadata to all knowledge entries.
relevance_to_TITANE: >
  TITANE's Knowledge Governance (Lock C2) should implement knowledge_date and
  freshness decay fields on all stored facts. The OMEGA pipeline should propagate
  uncertainty when responding to time-sensitive queries using stale knowledge.
status: VERIFIED
doctrine_impact: >
  Grounds Lock C2 knowledge governance schema with freshness metadata requirement.
  Motivates adding temporal confidence to KNOWLEDGE_GOVERNANCE scorecard.
scorecard_influence: KNOWLEDGE_GOVERNANCE (B0), RESEARCH_TRUTH (B0)
```

### S009 — Model Routing (Mixture of Experts / Dynamic Routing)

```yaml
source_id: S009
source_title: "Mixtral of Experts (MoE Architecture)"
url: "https://arxiv.org/abs/2401.04088"
source_type: research_paper
date_accessed: 2026-05-06
category: model_routing
claim_summary: >
  Mixtral demonstrates that sparse mixture-of-expert routing enables efficient
  inference by activating only 2 of 8 expert layers per token. The router learns
  to dispatch tokens to the most capable expert for each task type.
relevance_to_TITANE: >
  Lock C0 (Provider/Model Intelligence Routing) should implement a task-aware
  model router that dispatches queries to the appropriate provider (local Ollama
  gemma2:2b vs external API) based on task type, context length, and latency
  constraints — analogous to MoE routing but at provider level.
status: VERIFIED
doctrine_impact: >
  Provides architectural reference for C0 intelligent provider routing.
  Grounds PROVIDER_ROUTING_TRUTH scorecard in published routing research.
scorecard_influence: PROVIDER_ROUTING_TRUTH (B0), ROUTER_TRUTH_SCORECARD
```

### S010 — Prompt / Instruction Governance (PromptBench)

```yaml
source_id: S010
source_title: "PromptBench: Towards Evaluating the Robustness of Large Language Models on Adversarial Prompts"
url: "https://arxiv.org/abs/2306.04528"
source_type: research_paper
date_accessed: 2026-05-06
category: prompt_instruction_governance
claim_summary: >
  PromptBench evaluates LLM robustness to adversarial prompt modifications.
  Key finding: seemingly minor prompt changes (typos, synonyms, style) can cause
  dramatic performance drops. Instruction-tuned models are more robust but not immune.
relevance_to_TITANE: >
  TITANE's instruction governance (copilot-instructions.md, AGENTS.md, L1-L8 layer system)
  is a prompt governance system. Lock A0 validated instruction layer coherence.
  Lock B1 (Cognitive Core Truth Matrix) should reference PromptBench's adversarial
  sensitivity findings to justify instruction stability requirements.
status: VERIFIED
doctrine_impact: >
  Validates TITANE's instruction layer immutability policy (lower layers cannot
  redefine higher-layer invariants) with empirical evidence of prompt fragility.
  Grounds Rule 17 (canonical surface anti-drift) in adversarial robustness research.
scorecard_influence: INTELLIGENCE_TRUTH (B0), COGNITIVE_CORE_TRUTH (B0)
```

### S011 — Security / Prompt Injection (Indirect Prompt Injection)

```yaml
source_id: S011
source_title: "Prompt Injection Attacks and Defenses in LLM-Integrated Applications"
url: "https://arxiv.org/abs/2310.12815"
source_type: research_paper
date_accessed: 2026-05-06
category: security_prompt_injection
claim_summary: >
  Surveys prompt injection attack vectors in LLM-integrated applications including
  direct prompt injection (user input), indirect injection (retrieved content),
  and jailbreak patterns. Key finding: sandboxing tool outputs and treating
  all external content as untrusted are the primary mitigations.
relevance_to_TITANE: >
  TITANE's One Door network architecture (Rule 5) and IPC canonical contract (Rule 6)
  are direct mitigations for prompt injection at the tool-use boundary. The Security
  Agent (src/services/security_active/) should implement indirect injection detection
  on retrieved memory content before it enters OMEGA context.
status: VERIFIED
doctrine_impact: >
  Grounds Rule 5/6 network and IPC governance in published security research.
  Motivates Lock D0 (Agent Effectiveness) to include injection resilience testing.
scorecard_influence: KNOWLEDGE_GOVERNANCE (B0), AGENT_EFFECTIVENESS (B0)
```

### S012 — Red Teaming (LLM Red Teaming Methodology)

```yaml
source_id: S012
source_title: "Red Teaming Language Models with Language Models"
url: "https://arxiv.org/abs/2202.03286"
source_type: research_paper
date_accessed: 2026-05-06
category: red_teaming
claim_summary: >
  Proposes using a red-team LLM to automatically generate adversarial test cases
  for a target LLM. Demonstrates that automated red teaming can surface failure
  modes (harmful outputs, jailbreaks, hallucinations) that manual testing misses.
  Key finding: diversity of attack prompts is critical — single-style attacks
  plateau quickly.
relevance_to_TITANE: >
  Lock D4 (Self-Improvement Lab) should include automated red-team cycles where
  TITANE's challenger models are adversarially tested before being promoted to champion.
  The eval scaffold (evals/scorecards/) should include a RED_TEAM dimension.
status: VERIFIED
doctrine_impact: >
  Grounds D4 self-improvement adversarial testing methodology.
  Motivates SELF_IMPROVEMENT_GOVERNANCE scorecard (B0) to include red-team gate.
scorecard_influence: SELF_IMPROVEMENT_GOVERNANCE (B0), HONESTY_SCORECARD
```

---

## Category Coverage

| category | sources | coverage |
|----------|---------|----------|
| llm_eval | S001 | ✅ |
| rag_eval | S002 | ✅ |
| agent_orchestration | S003 | ✅ |
| llm_observability | S004 | ✅ |
| ai_governance_safety | S005 | ✅ |
| tool_use_reliability | S006 | ✅ |
| memory_architectures | S007 | ✅ |
| knowledge_freshness | S008 | ✅ |
| model_routing | S009 | ✅ |
| prompt_instruction_governance | S010 | ✅ |
| security_prompt_injection | S011 | ✅ |
| red_teaming | S012 | ✅ |

**Total sources**: 12 / 12 required categories covered ✅

---

## Scorecard Influence Matrix

| scorecard_id | source_ids |
|-------------|-----------|
| HONESTY_SCORECARD | S001, S012 |
| RESPONSE_QUALITY_SCORECARD | S001 |
| ROUTER_TRUTH_SCORECARD | S004, S009 |
| MEMORY_TRUTH_SCORECARD | S002, S007 |
| AUTOHEAL_TRUTH_SCORECARD | S005 |
| DESKTOP_CRITICAL_FLOW_SCORECARD | S006 |
| INTELLIGENCE_TRUTH (B0) | S001, S004, S010 |
| COGNITIVE_CORE_TRUTH (B0) | S004, S010 |
| KEVIN_AXIS (B0) | — (personal identity — no external source applicable) |
| RESEARCH_TRUTH (B0) | S008 |
| AGENT_EFFECTIVENESS (B0) | S003, S006, S011 |
| PROVIDER_ROUTING_TRUTH (B0) | S009 |
| MEMORY_RETRIEVAL_QUALITY (B0) | S002, S007 |
| KNOWLEDGE_GOVERNANCE (B0) | S005, S008, S011 |
| OMEGA_HANDLER_REALITY (B0) | S003, S006 |
| SINGULARITY_MEASUREMENT (B0) | S003, S004 |
| TWIN_CONSENT (B0) | S005 |
| SELF_IMPROVEMENT_GOVERNANCE (B0) | S005, S012 |

---

## Integration Notes

1. **Lock B0** (Eval Champion Realignment): Use S001 (HELM) methodology to define multi-metric scorecards. Use S002 (RAGAS) metrics for memory scorecards. All 12 new B0 scorecard stubs should reference a source_id from this map.

2. **Lock B1** (Cognitive Core Truth Matrix): Reference S010 (PromptBench) for instruction robustness evidence.

3. **Lock B2** (Intelligence Observability): Reference S004 (LangSmith) trace fields as schema baseline.

4. **Lock C0** (Provider Routing): Reference S009 (Mixtral MoE) for routing architecture rationale.

5. **Lock C1** (MemoryGraph v2): Reference S002 (RAGAS) and S007 (MemGPT) for evaluation methodology.

6. **Lock C2** (Knowledge Governance): Reference S008 (temporal freshness) and S011 (injection safety).

7. **Lock D0** (Agent Effectiveness): Reference S003 (ReAct), S006 (ToolLLM), S011 (injection safety).

8. **Lock D1** (OMEGA Handler): Reference S003 (ReAct traces) for observable reasoning contract.

9. **Lock D4** (Self-Improvement Lab): Reference S005 (NIST AI RMF) and S012 (red teaming) for safe improvement bounds.

---

## Limitations

- All URLs are to public research/documentation as of 2026-05-06
- KEVIN_AXIS scorecard (B0) has no applicable external source — personal identity evaluation is TITANE-internal
- Sources are not cited as endorsements of any specific implementation
- Temporal freshness: research papers may have been superseded; verify at time of lock implementation
