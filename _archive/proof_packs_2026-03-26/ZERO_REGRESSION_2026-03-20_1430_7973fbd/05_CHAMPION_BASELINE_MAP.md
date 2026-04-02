# 05 — CHAMPION BASELINE MAP
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Identification Method
Based on: git tags, latest proof pack, last session VERDICT DONE, HEAD state.

---

## Champion Identity

| Field | Value |
|-------|-------|
| Champion tag | v28.0.0 |
| Champion HEAD | 7973fbdec |
| Champion branch | MAIN |
| Champion approved date | 2026-03-20 (last session VERDICT DONE) |
| Champion proof pack | SESSION_COMPLETE (all 5 LOCK fixes closed) |
| Rollback target | git checkout f3939e2bc (v28.0.0 tag parent) or `git reset --hard v28.0.0` |

---

## Current Active Policies

### Prompt Policy
- **Status:** WIRED_BUT_UNPROVEN
- **Location:** src/services/ai/chatEngine.ts, src/services/ai/responsePolicy.ts
- **Behavior:** System prompt assembled from: base_system_prompt + memory_injection + persona + chat_mode
- **Proof level:** Partial — LOCK1-LOCK5 fixed wiring, no eval suite verifies prompt assembly correctness

### Routing Policy
- **Status:** PARTIAL_CHAIN
- **Location:** src-tauri/src/runtime_real.rs + provider refactor files
- **Behavior:** Online-first, local Ollama fallback, provider selection via runtime config
- **Active providers:** Ollama (local), Gemini (remote), potentially others
- **Proof level:** LOCK1 fixed provider_used display, no routing correctness eval

### Memory Policy
- **Status:** PARTIAL_CHAIN
- **Location:** src/services/ai/memoryIntegration.ts + src-tauri/src/memory_persistence.rs
- **Behavior:** Save after response, recall on conversation load, inject into system prompt
- **Proof level:** LOCK4 (backend sync) + G1 (injection truth) fixed, no round-trip eval

### Auto-Heal Policy
- **Status:** WIRED_BUT_UNPROVEN
- **Location:** scripts/autoheal/autoheal_rules.jsonl + src/services/ai/autoHealEngine.ts
- **Behavior:** Detect failure → classify → apply bounded fix → append autoheal entry → verify
- **Proof level:** Process documented, detect_recurrence.sh exists, no eval proves heal→truth

### Active Providers
- Ollama (local, primary in offline/local mode)
- Gemini (remote, primary in online mode)
- Status: PARTIAL_CHAIN (One Door via network_gateway.rs confirmed, provider routing correctness unproven)

### Active Models (from recent sessions)
- Local: whatever model is loaded in Ollama (e.g., llama3, mistral)
- Remote: Gemini model(s) via API

### Stable Tests/Evals
- **Unit tests:** tests/ (TypeScript/Vitest)
- **E2E:** e2e/ (WebdriverIO)
- **Performance benchmarks:** tests/performance/benchmarks.test.ts
- **Gate scripts:** scripts/gates/ (g1-g9, ring-integrity, etc.)
- **verify_instructions.sh** (present, passes on current HEAD)
- **scorecard-ci-gate-v2.sh** (present in scripts/verify/)
- **NO** versioned eval datasets in `evals/` — ABSENT

### Approved Proof Packs
1. SESSION_COMPLETE at 7973fbdec (all 5 locks closed)
2. XP_RUNTIME_TRUTH_HEAL_2026-03-18_0021_0ea87b257
3. WEBKIT_BOOT_OLLAMA_AUTOHEAL_2026-03-16_2131_ea50a6493

### Rollback Commands
```bash
# To champion tag:
git reset --hard v28.0.0
# To specific commit (before this session's changes):
git reset --hard 7973fbdec
# To remove new-only files (no production changes):
git clean -fd evals/ proof_packs/ZERO_REGRESSION_2026-03-20_1430_7973fbd/ scripts/verify/verify_evals_scaffold.sh
```

---

## Known Champion Weaknesses (acknowledged, not blocking)

1. No `evals/` directory — champion/challenger model has zero enforcement infrastructure
2. Node.js v18 incompatibility — blocks JS-based eval execution
3. All 10 critical chains are PARTIAL_CHAIN or WIRED_BUT_UNPROVEN — no PROVEN_RUNTIME
4. evaluator.rs in src-tauri/src/ai/ is UNKNOWN status (dormant?)
