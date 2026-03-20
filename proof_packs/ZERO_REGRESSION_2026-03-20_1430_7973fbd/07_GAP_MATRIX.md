# 07 — GAP MATRIX
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Classification Legend
- **PROVEN_RUNTIME** — executed and verified in production/E2E with passing evidence
- **PROVEN_STATIC** — verified by static analysis / type check / linting with passing evidence
- **WIRED_BUT_UNPROVEN** — code path exists and is plausibly correct but has no eval/test coverage
- **PARTIAL_CHAIN** — some steps covered by evidence, but end-to-end truth unverified
- **STUB_PATH** — placeholder code, not actually functional
- **DOC_ONLY** — documented in spec/plans but no implementation
- **REGRESSION_RISK** — previously working, recently changed, no regression eval
- **SHADOW_ONLY** — allowed to run in observation mode, not promoted
- **BLOCKED_BY_ENV** — would work but environment prevents execution
- **UNKNOWN** — cannot determine status without further investigation

---

## Critical Surfaces Gap Matrix

| Surface | Status | Evidence | Blocker |
|---------|--------|----------|---------|
| Chat send → IPC → backend | PARTIAL_CHAIN | LOCK1 fix, manual sessions | No automated eval |
| Response assembly (prompt+memory+mode) | WIRED_BUT_UNPROVEN | Code exists, reviewed | No eval verifying output |
| Memory save → DB persistence | PARTIAL_CHAIN | LOCK4 fix, unit-level | No round-trip E2E eval |
| Memory recall → injection → prompt | PARTIAL_CHAIN | G1+G2 fix | No automated trace eval |
| Provider routing selection | PARTIAL_CHAIN | LOCK1 wired to UI | No routing correctness eval |
| Provider fallback labeling (honesty) | WIRED_BUT_UNPROVEN | circuitBreaker.ts exists | No honesty eval |
| Auto-heal classification | WIRED_BUT_UNPROVEN | detect_recurrence.sh partial | No masking detection eval |
| UI truth labels (provider, memory, health) | REGRESSION_RISK | LOCK1/LOCK3 fixed | No anti-lie eval suite |
| Desktop app launch → health bootstrap | PARTIAL_CHAIN | LOCK3 fix | No desktop E2E eval |
| IPC contract `{ ok, content, error }` | PROVEN_STATIC | Type definitions + handlers | Runtime validation absent |
| One Door network (network_gateway.rs) | PROVEN_STATIC | g_network_one_door.sh gate | Runtime path unverified |
| Tauri allowlist compliance | PROVEN_STATIC | g7-tauri-allowlist-lock.sh | Dynamic IPC calls unverified |
| Chat mode persistence | PARTIAL_CHAIN | LOCK5 fix | No persistence eval |
| Persona/agent prompt injection | WIRED_BUT_UNPROVEN | persona_agent.ts exists | Not tested in eval suite |
| Streaming response | WIRED_BUT_UNPROVEN | streaming.rs + frontend | No eval |
| Error states (explicit, not silent) | WIRED_BUT_UNPROVEN | error.rs + error_handling.rs | No eval |
| Eval datasets | STUB_PATH | ABSENT — evals/ dir missing | **ROOT LOCK** |
| Eval scorecards | STUB_PATH | ABSENT — no JSON scorecards | **ROOT LOCK** |
| Champion/challenger comparison | DOC_ONLY | This proof pack defines it | No runner implementation |
| Shadow observation lane | DOC_ONLY | Defined in this proof pack | No runner implementation |
| Versioned benchmark baselines | STUB_PATH | .performance-results/ exists (perf only) | No AI eval baselines |
| AutoHeal masking detection | WIRED_BUT_UNPROVEN | detect_recurrence.sh | Incomplete coverage |
| Ring architecture enforcement | PROVEN_STATIC | ring-integrity-gate.sh PASS | Import analysis only |
| 4-Ring import inversions | PROVEN_STATIC | architect-guardian agent | Static, not runtime |

---

## Eval Lane Status

| Lane | Name | Status | Blocker |
|------|------|--------|---------|
| A | Golden Task Evals | STUB_PATH | evals/ absent |
| B | Critical Chain Evals | STUB_PATH | evals/ absent |
| C | Regression Evals | STUB_PATH | evals/ absent |
| D | Safety/Honesty Evals | STUB_PATH | evals/ absent |
| E | Stability X3 | STUB_PATH | evals/ absent + Node v18 |
| F | Shadow Observation | DOC_ONLY | No runner |

---

## Gates Status (current HEAD)

| Gate | Name | Status | Evidence |
|------|------|--------|----------|
| G_BOOT_TRUTH | Bootstrap verified | PASS | git status clean, versions logged |
| G_DISCOVERY_TRUTH | Discovery complete | PASS | All matrices produced |
| G_CHAMPION_BASELINE_DEFINED | Champion identified | PASS | v28.0.0 / 7973fbdec |
| G_EVAL_DATASET_VERSIONED | Datasets exist | **FAIL** | evals/datasets/ absent |
| G_SCORECARDS_PRESENT | Scorecards exist | **FAIL** | No JSON scorecards |
| G_CRITICAL_CHAINS_PASS | All chains proven | **FAIL** | 0/10 PROVEN_RUNTIME |
| G_HONESTY_NO_REGRESSION | Honesty eval | **BLOCKED** | No eval suite |
| G_MEMORY_NO_REGRESSION | Memory eval | **BLOCKED** | No eval suite |
| G_ROUTER_NO_REGRESSION | Router eval | **BLOCKED** | No eval suite |
| G_AUTOHEAL_NO_MASKING | AutoHeal eval | PARTIAL | detect_recurrence.sh only |
| G_DESKTOP_CRITICAL_FLOW_NO_REGRESSION | Desktop E2E | **BLOCKED** | Node v18 incompatibility |
| G_X3_STABILITY | 3x reruns | **BLOCKED** | No eval suite |
| G_ROLLBACK_READY | Rollback defined | PASS | git reset --hard v28.0.0 |
| G_PROOF_PACK_COMPLETE | Proof pack | IN_PROGRESS | This session |

**BLOCKING gates FAILING: 3 (DATASET, SCORECARDS, CHAINS)**
**BLOCKING gates BLOCKED: 4 (HONESTY, MEMORY, ROUTER, DESKTOP)**
