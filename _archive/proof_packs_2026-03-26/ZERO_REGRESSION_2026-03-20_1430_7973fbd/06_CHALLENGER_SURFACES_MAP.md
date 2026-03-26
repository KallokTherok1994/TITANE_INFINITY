# 06 — CHALLENGER SURFACES MAP
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Definition
A "challenger surface" is any area of the codebase that can change and introduce a regression in a critical chain or truth property.

---

## Challenger Surfaces Inventory

### CS-01 — Prompt Templates
- **Location:** src/services/ai/chatEngine.ts, any system_prompt assembly
- **Evolution risk:** Prompt wording changes alter response tone, truthfulness, memory injection
- **Blocking metrics:** honesty, memory continuity, response quality
- **Current eval coverage:** NONE
- **Promotion gate:** G_HONESTY_NO_REGRESSION + G_MEMORY_NO_REGRESSION

### CS-02 — Response Policy
- **Location:** src/services/ai/responsePolicy.ts
- **Evolution risk:** Policy changes alter filtering, truncation, format enforcement
- **Blocking metrics:** response quality, honesty, structured output correctness
- **Current eval coverage:** NONE
- **Promotion gate:** G_HONESTY_NO_REGRESSION + G_CRITICAL_CHAINS_PASS

### CS-03 — Routing Heuristics
- **Location:** src-tauri/src/runtime_real.rs + provider refactor files
- **Evolution risk:** Provider selection logic changes route to wrong provider silently
- **Blocking metrics:** provider truth, routing correctness, fallback honesty
- **Current eval coverage:** NONE
- **Promotion gate:** G_ROUTER_NO_REGRESSION

### CS-04 — Memory Heuristics
- **Location:** src/services/ai/memoryIntegration.ts + memoryStore.ts
- **Evolution risk:** Memory injection logic changes cause stale/wrong/missing context
- **Blocking metrics:** memory continuity, memory truth, prompt correctness
- **Current eval coverage:** NONE
- **Promotion gate:** G_MEMORY_NO_REGRESSION

### CS-05 — AutoHeal Rules
- **Location:** scripts/autoheal/autoheal_rules.jsonl + src/services/ai/autoHealEngine.ts
- **Evolution risk:** New heal rules mask failures or create false "healed" UI states
- **Blocking metrics:** autoheal truthfulness, UI honesty
- **Current eval coverage:** detect_recurrence.sh (partial)
- **Promotion gate:** G_AUTOHEAL_NO_MASKING

### CS-06 — Truth Labels (UI)
- **Location:** src/components/ — any component showing provider name, memory status, health state, mode name
- **Evolution risk:** Label changes claim "improved", "learned", "healed" without runtime proof
- **Blocking metrics:** honesty, anti-lie system
- **Current eval coverage:** NONE
- **Promotion gate:** G_HONESTY_NO_REGRESSION

### CS-07 — Tool Policies
- **Location:** src/services/agents/, src-tauri/src/commands/
- **Evolution risk:** New tool calls without IPC contract or allowlist update
- **Blocking metrics:** IPC contract truth, Tauri allowlist compliance
- **Current eval coverage:** g7-tauri-allowlist-lock.sh (present, not in eval suite)
- **Promotion gate:** G_CRITICAL_CHAINS_PASS

### CS-08 — Provider Fallbacks
- **Location:** src/services/ai/circuitBreaker.ts + retryStrategy.ts + src-tauri/ provider files
- **Evolution risk:** Fallback silently routes to wrong provider without UI notification
- **Blocking metrics:** fallback honesty, provider truth
- **Current eval coverage:** NONE
- **Promotion gate:** G_ROUTER_NO_REGRESSION + G_HONESTY_NO_REGRESSION

### CS-09 — Scoring Logic (Evals)
- **Location:** NOT YET EXISTS (evals/ to be created)
- **Evolution risk:** Eval thresholds lowered to hide regressions; cherry-picked benchmarks
- **Blocking metrics:** eval integrity itself
- **Current eval coverage:** N/A — no eval suite
- **Promotion gate:** G_SCORECARDS_PRESENT

### CS-10 — UI State Derivation
- **Location:** src/stores/ (all 24 store files), src/hooks/
- **Evolution risk:** Store logic change causes wrong state → UI shows false "active", "healthy"
- **Blocking metrics:** UI truth, honesty
- **Current eval coverage:** NONE
- **Promotion gate:** G_HONESTY_NO_REGRESSION + G_DESKTOP_CRITICAL_FLOW_NO_REGRESSION

### CS-11 — Chat Mode Config
- **Location:** src/services/ai/chatModes.ts + chatModes.config.ts
- **Evolution risk:** Mode changes alter persona/prompt without eval verification
- **Blocking metrics:** response quality, persona consistency
- **Current eval coverage:** NONE
- **Promotion gate:** G_CRITICAL_CHAINS_PASS

### CS-12 — IPC Contract
- **Location:** src-tauri/src/api/*.rs + src/api/tauriClient.ts
- **Evolution risk:** IPC payload shape change breaks `{ ok, content, error }` contract
- **Blocking metrics:** all chains (IPC is the backbone)
- **Current eval coverage:** PARTIAL (gate scripts)
- **Promotion gate:** G_CRITICAL_CHAINS_PASS + tauri-safety agent review

---

## Risk Matrix

| Surface | Current Coverage | Blocking Gates | Risk Level |
|---------|-----------------|----------------|------------|
| CS-01 Prompt Templates | NONE | 2 | 🔴 CRITICAL |
| CS-02 Response Policy | NONE | 2 | 🔴 CRITICAL |
| CS-03 Routing Heuristics | NONE | 1 | 🔴 CRITICAL |
| CS-04 Memory Heuristics | NONE | 1 | 🔴 CRITICAL |
| CS-05 AutoHeal Rules | PARTIAL | 1 | 🟡 MEDIUM |
| CS-06 Truth Labels | NONE | 1 | 🔴 CRITICAL |
| CS-07 Tool Policies | PARTIAL | 1 | 🟡 MEDIUM |
| CS-08 Provider Fallbacks | NONE | 2 | 🔴 CRITICAL |
| CS-09 Scoring Logic | N/A | 1 | 🔴 CRITICAL (meta) |
| CS-10 UI State Derivation | NONE | 2 | 🔴 CRITICAL |
| CS-11 Chat Mode Config | NONE | 1 | 🟡 MEDIUM |
| CS-12 IPC Contract | PARTIAL | 2 | 🟡 MEDIUM |

**6/12 surfaces at CRITICAL risk with ZERO eval coverage.**
This confirms the single real lock: MISSING_EVAL_INFRASTRUCTURE.
