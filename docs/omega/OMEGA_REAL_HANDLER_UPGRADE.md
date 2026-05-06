# TITANE∞ — OMEGA Real Handler Upgrade

**Lock:** D1  
**Super Prompt:** v13  
**Mode:** DURABLE  
**Date:** 2026-05-06  

---

## Purpose

This document records the governed approach for connecting the first real OMEGA cognitive handler behind a safety gate (feature flag + shadow mode).

D1 upgrades the OMEGA executor boundary by: (1) identifying 3 structural gaps in the DefaultTaskHandler mock surface, (2) defining invariants for the upgrade path, (3) selecting the Memory handler as the first real handler, and (4) declaring a shadow/passive contract for safe, proof-first integration.

---

## OMEGA Executor Architecture

The OMEGA v2 pipeline (`src-tauri/src/omega/executor.rs`) runs tasks in parallel using the `TaskHandler` trait. All 8 task types (Memory, Knowledge, Reasoning, Safety, Context, Identity, CodeGen, TextGen) currently use `DefaultTaskHandler` — a mock that returns heuristic JSON.

```
ParallelExecutor
  ├── TaskType::Memory    → DefaultTaskHandler (mock: {"relevant_items": [], "relevance_score": 0.7})
  ├── TaskType::Knowledge → DefaultTaskHandler (mock: {"sources": [], "confidence": 0.8})
  ├── TaskType::Safety    → DefaultTaskHandler (mock: {"safe": true, "score": 0.95})
  ├── TaskType::Identity  → DefaultTaskHandler (mock: {"archetype": "mentor"})
  ├── TaskType::Context   → DefaultTaskHandler (mock: {"enriched": true})
  ├── TaskType::Reasoning → DefaultTaskHandler (mock: {"analysis": "Processed"})
  ├── TaskType::CodeGen   → DefaultTaskHandler (mock: {"code": ""})
  └── TaskType::TextGen   → DefaultTaskHandler (mock: {"text": ""})
```

`register_handler()` (line 489 of executor.rs) allows injecting a real handler per task type.

---

## Real Memory Surface (OmegaMemoryBridge)

**File:** `src-tauri/src/omega/memory_bridge.rs`  
**Surface:** `OmegaMemoryBridge` struct  
**Key method:** `enrich_context(&mut OmegaContextV2)` — queries UnifiedMemory/MemoryOS for STM/MTM/LTM/vector results.

This is the existing real memory surface created in the C1 shadow phase. It reads from UnifiedMemory (baseline) and can query MemoryGraph (disabled by default).

---

## D1 Handler Selection

| Criterion | Memory | Knowledge |
|-----------|--------|-----------|
| Real surface exists | YES — OmegaMemoryBridge | NO |
| Minimal patch | YES | NO |
| Shadow mode available | YES | — |
| Identity risk | LOW (shadow-only) | — |
| MemoryGraph v2 risk | MITIGATED (flag=false) | — |

**Selected: Memory Handler**  
**Rust surface:** `src-tauri/src/omega/memory_bridge.rs::OmegaMemoryBridge::enrich_context`

---

## Feature Flags

| Flag | Default | Gate | Purpose |
|------|---------|------|---------|
| `VITE_TITANE_D1_OMEGA_REAL_HANDLER` | false | T3 | Enable D1 invariant enforcement at boundary |
| `VITE_TITANE_D1_OMEGA_REAL_MEMORY_HANDLER` | false | T3 | Enable Memory handler shadow path |

Both flags are OFF in production. Both require D2 promotion gate before activation.

---

## D1 Gaps Addressed

| Gap | Description | Severity | Status |
|-----|------------|----------|--------|
| D1-G1 | No structured response quality validation | high | ADDRESSED in contract |
| D1-G2 | No latency budget enforcement | CRITICAL | ADDRESSED in contract |
| D1-G3 | Provider fallback transparency | high | ADDRESSED in contract |

---

## Handler Contract (v13 Sidecar)

Defined in: `src/services/omega_handler/OmegaHandlerUpgradeContract.ts`

Key exports:
- `D1_SELECTED_HANDLER = 'Memory'`
- `D1_MEMORY_HANDLER_DEFAULT_MODE = 'shadow'`
- `OMEGA_D1_MEMORY_HANDLER_FLAG` (env-driven, default false)
- `D1_MEMORY_HANDLER_KNOWN_LIMITS[]` (5 documented limits)
- `OmegaMemoryHandlerInputSchema` / `OmegaMemoryHandlerOutputSchema`
- `D1SelectedHandlerAdapterSchema`
- `getD1SelectedHandlerAdapter()` — canonical adapter factory
- `validateMemoryHandlerOutput()` — policy enforcement
- `buildShadowMemoryHandlerOutput()` — test/scaffold factory

---

## Known Limits (D1 shadow mode)

1. shadow-mode-only: output not injected into OMEGA conversation pipeline  
2. identity-sensitive-ops-blocked: D2+ identity validation required  
3. memory-graph-v2-inactive: UnifiedMemory is baseline, MemoryGraph v2 read path not activated  
4. no-persistent-write: shadow reads only, no memory writes from this handler  
5. flag-must-be-false-in-prod: requires D2 promotion gate before activation  

---

## Test Coverage

| Test Group | Tests | Status |
|------------|-------|--------|
| D1GapSchema + D1_GAPS | 12 | PASS |
| D1_INVARIANTS | 6 | PASS |
| validateOmegaHandlerResponse | 12 | PASS |
| OmegaHandlerRequestSchema / ResponseSchema | 8 | PASS |
| getD1OmegaHandlerContract | 6 | PASS |
| D1-UNIT-01..10 (v13 Memory handler) | 10 | PASS |
| OmegaHandlerModeSchema | 2 | PASS |
| validateMemoryHandlerOutput | 4 | PASS |
| OmegaMemoryHandlerInputSchema | 2 | PASS |
| **Total** | **62** | **PASS** |

---

## Rollback

1. Revert sidecar additions to `OmegaHandlerUpgradeContract.ts` (lines 208-359)
2. Revert test imports and D1-UNIT test groups in test file
3. Set `VITE_TITANE_D1_OMEGA_REAL_MEMORY_HANDLER=false` (already default)
4. No Rust code was changed — no Rust rollback required
5. Git: `git restore src/services/omega_handler/OmegaHandlerUpgradeContract.ts src/services/omega_handler/__tests__/OmegaHandlerUpgradeContract.test.ts`

---

## Next Lock: D2

D2 will promote the Memory handler from shadow to passive (trace visible), and integrate the real Rust `OmegaRealMemoryHandler` into the ParallelExecutor registry with `register_handler()`.

D2 requires:
- Identity validation gate (D2-I1)
- Latency benchmark evidence for real Memory handler
- MemoryGraph v2 read path evaluation
- Full E2E trace proof (AI-DESKTOP-11 promotion from SCAFFOLDED to PASS)
