# Knowledge Governance Matrix

Lock: B1
Date: 2026-05-06
Type: T0/T1

| subsystem | files inspected | claimed capability | actual observed implementation | classification | proof signal | risk | next lock dependency | scorecard dependency | Desktop test dependency |
|---|---|---|---|---|---|---|---|---|---|
| KnowledgeBaseDefault | src-tauri/src/knowledge_base_default.rs | Default knowledge availability for responses | Base knowledge file exists; governance metadata depends on sidecar/index evolution | PARTIAL | Source file present + C2 lock history | Freshness and provenance ambiguity | C2 | KNOWLEDGE_GOVERNANCE_SCORECARD | AI-DESKTOP-08 |
| Knowledge governance contract | src/services/knowledge_governance/KnowledgeGovernanceContract.ts | Validate governance metadata fields and constraints | Contract exists with tests in prior lock; deployment coverage remains to be certified | HEURISTIC | C2 contract + tests prior lock | Metadata bypass risk in non-contracted paths | C2, F0 | KNOWLEDGE_GOVERNANCE_SCORECARD | AI-DESKTOP-08, AI-DESKTOP-20 |
