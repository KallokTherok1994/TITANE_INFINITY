# Lock C0 — Provider / Model Intelligence Routing — VERDICT

**VERDICT: DRIFT_FOUND_FIXED**
**Date:** 2026-05-06
**Lock:** C0 — Provider / Model Intelligence Routing

## Drift Fixed

**CD-01** (from COGNITIVE_CORE_TRUTH_MATRIX):  
`chat_orchestrator.rs` Ollama streaming fallback was `llama3.1:latest` — PROD requires `gemma2:2b`.

## Deliverables

1. `TITANE_PROD_OLLAMA_MODEL = "gemma2:2b"` constant in `chat_orchestrator.rs`
2. `resolve_ollama_model_c0()` — T3 function behind `TITANE_C0_PROVIDER_ROUTING_ENABLED` flag (default=false)
3. `src/services/routing/ProviderRoutingContract.ts` — Zod contract with invariants CD-01 + BOUNDARY-DEV
4. 22 TypeScript unit tests + 3 new Rust smoke tests (5 total)

## Feature Flag Safety (T3)

- `TITANE_C0_PROVIDER_ROUTING_ENABLED=false` (default): legacy behavior preserved
- `TITANE_C0_PROVIDER_ROUTING_ENABLED=true`: resolves `gemma2:2b` for PROD pipeline  
- Explicit model always wins (explicit > flag > legacy)

## Gates

| Gate | Status |
|------|--------|
| Rust smoke_tests | PASS=5 FAIL=0 |
| vitest ProviderRoutingContract | PASS=22 FAIL=0 |
| verify_instructions.sh | PASS=51 FAIL=0 |
| detect_recurrence.sh | PASS (entries=1648) |
