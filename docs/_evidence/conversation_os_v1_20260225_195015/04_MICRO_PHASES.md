# 04_MICRO_PHASES.md

## EXECUTION ORDER (IMMUTABLE)

### Ordre exact
1. META-EXECUTION (`00_PLAN.md`, `01_TRUTH_SNAPSHOT.md`)
2. Hard Blockers + Gates (`09_GATES_STATUS.md`)
3. Consistency 4-Ring (`06_RING_SURFACE_MAP.md`)
4. Network governance hardening (gateway spec + tests)
5. Determinism enforcement (`10_TEST_RUNS_X3.md`)
6. Memory governance (`15_RISKS.md` + mapping mémoire)
7. Failure simulations (`13_FAILURE_SIMULATIONS.md`)
8. Performance stability (`12_PERFORMANCE_METRICS.md`)
9. Self-check loop final (`15_RISKS.md`)
10. Release qualification protocol (final checklist)

### Préconditions avant chaque phase
- `git status --short` propre (hors fichiers d’évidence).
- Règles de phase précédente documentées avec commande + résultat attendu.
- Aucun invariant hard-blocker non instrumenté.

### Conditions d’arrêt (stop-the-line)
- Ordre modifié ou phase sautée.
- Commande de détection absente.
- Résultat non testable (UNKNOWN non traité).

### Statut actuel
- Phase active: 4 (Network governance hardening)
- Ring impacté: **Ring 3 (Services) + Ring 4 (Orchestration)**
- Statut changement: **EXPERIMENTAL**

### Plan en cours
- Référence active: `28_H2_STEP4_PLAN.md`
