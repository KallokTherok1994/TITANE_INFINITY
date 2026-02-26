# 04_MICRO_PHASES.md

Date (UTC): 2026-02-26
Ordre: **IMMUTABLE**

## 1A — Execution Path Map (DOC-ONLY, STABLE)
- Objectif: cartographier entrypoints chat + bypass legacy.
- Rings: 4
- Gate: `G_LEGACY_PATHS_MAPPED`
- Verdict phase: PASS

## 1B — Scope Lock Validation (DOC-ONLY, STABLE)
- Objectif: sceller le périmètre autorisé/interdit.
- Rings: 4
- Gate: `G_SCOPE_FROZEN`
- Verdict phase: PASS

## 2A — Event Store Minimal (RUNTIME, STABLE)
- Objectif: valider `events/provider_decisions/failures` + append-only + hash.
- Rings: 3
- Gates: `G_DB_WRITE_READ_HASH_X3`, `G_EVENTS_APPEND_ONLY`
- Verdict phase: PASS

## 3A — PolicyEngine First (RUNTIME, STABLE)
- Objectif: règles dures + raison explicite.
- Rings: 2
- Gates: `G_NO_SILENT_FALLBACK`, `G_POLICY_ENFORCED`
- Verdict phase: PASS

## 3B — RouterEngine Deterministic (RUNTIME, STABLE)
- Objectif: classifier déterministe.
- Rings: 2
- Gate: `G_ROUTER_DETERMINISTIC`
- Verdict phase: PASS

## 4A — NetworkGatewayService + Allowlist (RUNTIME, STABLE)
- Objectif: deny-by-default + timeout + budget + meta réseau.
- Rings: 3
- Gates: `G_GATEWAY_ALLOWLIST_ONLY`, `G_FRONTEND_NO_WEB`, `G_NETWORK_META_COMPLETE`
- Verdict phase: PARTIAL (allowlist validée, `NetworkMeta` complet non prouvé)

## 4B — ResilienceEngine (RUNTIME, QUALIFIED)
- Objectif: netstate/backoff/breaker/budgets.
- Rings: 2
- Gates: `G_NETSTATE_TRANSITIONS_VALID`, `G_BUDGET_ENFORCED`
- Verdict phase: PASS

## 5A — Orchestrator v1 Single Pipeline (RUNTIME, STABLE CANDIDATE)
- Objectif: pipeline unique du trace à la persistance.
- Rings: 2+3+4
- Gate: `G_ORCHESTRATOR_SINGLE`
- Verdict phase: PARTIAL (preuves persistence/reproductibilité PASS; preuve pipeline UI bout-en-bout manquante)

## 5B — Legacy Path Kill (RUNTIME, STABLE)
- Objectif: UI ne peut pas atteindre les chemins legacy.
- Rings: 4
- Gate: `G_LEGACY_UNREACHABLE_FROM_UI`
- Verdict phase: PASS

## 6A — SearchGateway Credentials Missing Explicit (RUNTIME, QUALIFIED)
- Objectif: `CREDENTIALS_MISSING` explicite + stockage failure.
- Rings: 3
- Gates: `G_SEARCH_CREDS_EXPLICIT`, `G_FAILURES_STORED`
- Verdict phase: PASS

## 6B — Search Success + Sources + Citations (RUNTIME, QUALIFIED)
- Objectif: normalisation, sources persistées, simulation 429.
- Rings: 3
- Gates: `G_SOURCES_STORED_AND_CITABLE`, `G_RATE_LIMIT_AWARE`
- Verdict phase: PARTIAL (sources/citations persistées PASS; simulation 429 reste manquante)

## 2B — Snapshots + Sources Full Schema (RUNTIME, STABLE)
- Objectif: schéma complet snapshots/sources + hash.
- Rings: 3
- Gates: `G_SNAPSHOT_CREATED_X3`, `G_SNAPSHOT_HASH_VALID`
- Verdict phase: PASS

## 7A — Canonical Memory (Snapshots First) (RUNTIME, STABLE)
- Objectif: recall + IDs internes traçables.
- Rings: 2+3
- Gate: `G_MEMORY_RECALL_INTERNAL_IDS`
- Verdict phase: BLOCKED (preuve recall x3 manquante)

## 7B — Vector LTM (OPTIONAL, QUALIFIED)
- Objectif: recall vectoriel si prouvé, sinon OFF justifié.
- Rings: 3
- Gate: `G_LTM_VECTOR_RECALL_QUALIFIED` (optionnel)
- Verdict phase: BLOCKED (resté OFF, non qualifié)

## 8A — Debug Panel Real Trace (UI, STABLE)
- Objectif: trace backend réelle visible UI.
- Rings: 4
- Gate: `G_DEBUG_PANEL_REAL_TRACE`
- Verdict phase: BLOCKED (preuve E2E dédiée manquante)

## 8B — Safe Optimizations (OPTIONAL, QUALIFIED)
- Objectif: optimisations traçables derrière flags.
- Rings: 3+4
- Gate: `G_OPTIMIZATIONS_TRACEABLE` (optionnel)
- Verdict phase: BLOCKED (non exécuté)

## 9 — Final Sealing Protocol (DOC + VERDICT)
- Objectif: simulations d’échec + perf + auto-audit + verdict unique.
- Rings: 4
- Gates: `G_FAILURE_SIMULATION_COMPLETE`, `G_PERF_METRICS_RECORDED`, `G_SELF_AUDIT_CLEAN`
- Verdict phase: PASS (verdict final explicite rédigé)

