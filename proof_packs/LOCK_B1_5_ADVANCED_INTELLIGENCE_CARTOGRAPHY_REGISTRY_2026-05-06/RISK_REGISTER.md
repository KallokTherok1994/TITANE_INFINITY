# Risk Register — B1.5

- R1: Registry drift if new locks are added without updates.
  - Mitigation: verify_advanced_intelligence_registry.sh gate.
- R2: Desktop test lanes indexed but not executed yet.
  - Mitigation: explicit PLANNED status and dependency on E0.
- R3: Legacy roadmap table still contains historical duplication.
  - Mitigation: v8 incremental control table added without destructive rewrite.

Residual risk: PARTIAL (runtime and desktop execution pending later locks).
