# NEXT LOCKS — Lock A0 v5 Reentry Plan
# Date: 2026-05-06
# Status: PLAN ONLY — none executed

## Lock Sequence

### A1 — Version / Release / Proof Authority Alignment

```
objective: Align version sources, release artifacts, checksums, and proof pack authority.
           Ensure version bump procedure is fully automated and traceable.
scope: package.json, Cargo.toml, scripts/bump-version.mjs, scripts/sync-versions.mjs,
       RELEASE_SURFACE_INVENTORY.md, RELEASE_ARTIFACTS_CHECKSUMS_*.txt
risk: HIGH — version mismatch can break CI/CD and release artifacts
proof required: version in package.json, Cargo.toml, tauri.conf.json all in sync;
                checksums file for current version present; bump script passes dry-run
research requirement: none (internal)
stopline: BLOCKED_APPROVAL if any production artifact files would change
recommended prompt type: heavy-runtime-session (durable, version-sensitive)
autopilot suitability: bounded only
```

### A2 — External AI Engineering Source Map

```
objective: Map external AI/ML engineering sources relevant to TITANE intelligence program.
           Track papers, frameworks, and standards that could inform B0–D5 locks.
scope: docs/research/AI_ENGINEERING_SOURCE_MAP.md (new file)
risk: LOW — advisory only, no runtime impact
proof required: source map validator PASS, no TO_VERIFY promoted as doctrine
research requirement: ArXiv, Anthropic docs, OpenAI docs, LLMOps frameworks
stopline: none (pure research)
recommended prompt type: simple-fast-session
autopilot suitability: yes
```

### B0 — Eval Champion Realignment

```
objective: Verify Ollama champion/challenger registry is current; align eval gates
           with actual runtime models (gemma2:2b, qwen2.5-coder).
scope: evals/, scripts/verify/challenger-eval-gate.sh, OLLAMA_RUNTIME_MAP.md
risk: MEDIUM — eval drift can hide model degradation
proof required: challenger eval gate PASS; champion model verified at gemma2:2b
research requirement: none
stopline: BLOCKED if prod model is not gemma2:2b
recommended prompt type: heavy-runtime-session
autopilot suitability: bounded only
```

### B1 — Cognitive Core Truth Matrix

```
objective: Map real cognitive capabilities from runtime signals (not hardcoded stubs).
           Document what OMEGA/conversation_engine actually executes vs what is claimed.
scope: src/services/explainability/, src/services/monitoring/, docs/
risk: MEDIUM — involves reading runtime signals
proof required: truth matrix populated with real runtime data; no fake capability claims
research requirement: Anthropic interpretability docs (candidate)
stopline: BLOCKED_APPROVAL if runtime code modification needed
recommended prompt type: heavy-runtime-session
autopilot suitability: no — requires runtime signal validation
```

### B2 — Intelligence Observability Contract

```
objective: Define what signals are observable from TITANE intelligence pipeline.
           Wire real monitoring metrics to explainability dashboard.
scope: src/services/explainability/, src/services/monitoring/
risk: HIGH — modifies Ring 3-4 services
proof required: E2E test PASS; dashboard shows real signals
research requirement: none
stopline: BLOCKED_APPROVAL for any Ring 2 changes
recommended prompt type: heavy-runtime-session
autopilot suitability: no
```

### C0 — Provider / Model Intelligence Routing

```
objective: Clean provider routing logic; align prod/dev model separation at code level.
scope: src-tauri/src/ai/ollama.rs, src-tauri/src/chat_orchestrator.rs
risk: HIGH — production chat routing
proof required: cargo test PASS; gemma2:2b confirmed as prod fallback
research requirement: Ollama API docs (candidate)
stopline: BLOCKED_APPROVAL — touches Ring 0 Rust prod code
recommended prompt type: heavy-runtime-session
autopilot suitability: no
```

### C1 — MemoryGraph v2 Shadow Mode

```
objective: Roll out hybrid-memory graph layer in shadow mode (dual-write, no read switch).
scope: src/engines/memory/, src-tauri/src/memory/
risk: HIGH — memory persistence changes
proof required: Vitest PASS; migration dry-run; shadow read verified
research requirement: none
stopline: BLOCKED_APPROVAL for any migration not reversible
recommended prompt type: start-hybrid-memory-dispatch
autopilot suitability: no
```

### C2 — Knowledge Governance

```
objective: Establish governance layer for TITANE knowledge base (KB).
           Define schema, lifecycle, and audit trail for KB entries.
scope: docs/governance/, evals/knowledge/
risk: LOW — docs/config only
proof required: KB governance validator PASS
research requirement: ISO/NIST AI governance docs (TO_VERIFY)
stopline: none for docs
recommended prompt type: simple-fast-session
autopilot suitability: bounded only
```

### C3 — Research Truth Engine

```
objective: Build lightweight research validation pipeline.
           Verify external claims before they enter doctrine.
scope: scripts/verify/verify_research_sources.sh, docs/research/
risk: LOW
proof required: validator PASS; all research entries have status field
research requirement: none (meta-research)
stopline: none
recommended prompt type: simple-fast-session
autopilot suitability: bounded only
```

### D0 — Agent Effectiveness System

```
objective: Measure and report on agent utilization, proof quality, and outcome rates.
scope: registry/ui-events.jsonl, scripts/verify/, docs/
risk: LOW
proof required: effectiveness report generated; at least 3 agents with outcome data
research requirement: LLMOps evals frameworks (candidate)
stopline: none
recommended prompt type: heavy-runtime-session
autopilot suitability: bounded only
```

### D1 — OMEGA Real Handler Upgrade

```
objective: Wire OMEGA conversation_generate to real handler implementations.
           Replace any stubbed responses with provable backend handlers.
scope: src-tauri/src/conversation_engine/
risk: CRITICAL — production conversation pipeline
proof required: cargo test PASS; integration test PASS; no stubbed response paths
research requirement: none
stopline: BLOCKED_APPROVAL — touches Ring 0
recommended prompt type: heavy-runtime-session
autopilot suitability: no
```

### D2 — Singularity Measured Layer

```
objective: Define measurable intelligence benchmarks for TITANE.
scope: evals/, docs/roadmap/
risk: LOW — evals and docs
proof required: benchmark defined; baseline measured; comparison protocol documented
research requirement: MMLU, HumanEval, HELM (TO_VERIFY)
stopline: none
recommended prompt type: simple-fast-session
autopilot suitability: bounded only
```

### D3 — Twin Consent Ledger

```
objective: Establish consent tracking for TITANE twin personality features.
scope: src/services/, data/consent/
risk: MEDIUM — user data governance
proof required: consent ledger schema defined; no PII stored without consent flag
research requirement: GDPR/CCPA compliance docs (TO_VERIFY)
stopline: BLOCKED_APPROVAL if user data involved
recommended prompt type: heavy-runtime-session
autopilot suitability: no
```

### D4 — Self-Improvement Lab

```
objective: Define controlled environment for TITANE self-improvement experiments.
scope: evals/lab/, docs/
risk: MEDIUM — needs isolation from production
proof required: lab env isolated; no production data contamination
research requirement: none
stopline: BLOCKED if prod data would be used without consent
recommended prompt type: heavy-runtime-session
autopilot suitability: bounded only
```

### D5 — Intelligence Seal

```
objective: Final seal of TITANE Advanced Intelligence Program Phase 1.
           Full program review, proof pack synthesis, release note.
scope: proof_packs/, docs/roadmap/, CHANGELOG.md (version bump)
risk: LOW
proof required: all A0–D4 locks SEALED; master gate PASS; program status SEALED
research requirement: none
stopline: none (seal only)
recommended prompt type: run-proof-pack
autopilot suitability: bounded only
```
