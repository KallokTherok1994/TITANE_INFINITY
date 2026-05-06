# Research Truth Matrix

Lock: B1
Date: 2026-05-06
Type: T0/T1

| subsystem | files inspected | claimed capability | actual observed implementation | classification | proof signal | risk | next lock dependency | scorecard dependency | Desktop test dependency |
|---|---|---|---|---|---|---|---|---|---|
| Research truth contract | src/services/research_truth/ResearchTruthContract.ts | Enforce sourced research or explicit unavailability | Contract exists and models RESEARCH_UNAVAILABLE patterns; web truth still environment-dependent | PARTIAL | C3 contract and prior tests | False-current-fact risk without source availability | C3 | RESEARCH_TRUTH_SCORECARD | AI-DESKTOP-09, AI-DESKTOP-10 |
| Research enricher surfaces | src/services/research_enricher/chatResearchDetector.ts, src/services/research_enricher/kbEnricher.ts | Detect when research should be invoked | Heuristic detector exists; end-to-end citation path is not fully certified here | HEURISTIC | Enricher service files and tests present | Missed research invocation | C3, E0 | RESEARCH_TRUTH_SCORECARD, INTELLIGENCE_TRUTH_SCORECARD | AI-DESKTOP-10, AI-DESKTOP-20 |
