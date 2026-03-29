# 03 — Gates Matrix

## MANDATORY BLOCKING GATES

| Gate | Status | Blocking | Evidence Source | Why Blocking/Non-blocking | Promotion Impact |
|------|--------|----------|-----------------|---------------------------|------------------|
| G_CHAMPION_BASELINE_DEFINED | **PASS** | No | `config/championChallenger.json` | Champion v28.0.0 clearly defined | Non-blocking |
| G_TRUTH_CONTRACT_SEALED | **PASS** | No | TRUTH_CONTRACT_SEALER verdict | Provider label truth contract sealed | Non-blocking |
| G_MEMORY_CONSUMPTION_REAL | **PASS** | No | MEMORY_FALLBACK_TRUTH_SEALER verdict | Memory consumption proven | Non-blocking |
| G_FALLBACK_HONEST | **PASS** | No | MEMORY_FALLBACK_TRUTH_SEALER verdict | Fallback honesty proven | Non-blocking |
| G_PROVIDER_MODE_LABELS_TRUE | **PASS** | No | TRUTH_CONTRACT_SEALER verdict | Provider labels match runtime truth | Non-blocking |
| G_CRITICAL_CHAINS_PASS | **FAIL** | **YES** | ZERO_REGRESSION_AUTO_MODE: Lane B 0/8 | Critical chain failures detected | **BLOCKS PROMOTION** |
| G_ANTI_LIE_PASS | **FAIL** | **YES** | ZERO_REGRESSION_AUTO_MODE: AV-07, AV-08 | Anti-lie violations present | **BLOCKS PROMOTION** |
| G_REGRESSION_NONE_ON_BLOCKING_AXES | **FAIL** | **YES** | ZERO_REGRESSION_AUTO_MODE: AV-07, AV-08 | Regression on truthfulness axis | **BLOCKS PROMOTION** |
| G_X3_STABILITY | **PASS** | No | ZERO_REGRESSION_AUTO_MODE: G_X3_STABILITY = true | X3 runs match | Non-blocking |
| G_DESKTOP_TRUTH_PASS | **PASS** | No | ZERO_REGRESSION_AUTO_MODE: G_DESKTOP_CRITICAL_FLOW_NO_REGRESSION = true | Desktop flow validated | Non-blocking |
| G_ROLLBACK_READY | **PASS** | No | `git reset --hard v28.0.0` | Rollback path explicit | Non-blocking |
| G_PROOF_PACK_COMPLETE | **FAIL** | **YES** | No post-patch proof pack | Proof pack not generated for candidate | **BLOCKS PROMOTION** |

## OPTIONAL GATES

| Gate | Status | Blocking | Evidence Source | Why Blocking/Non-blocking | Promotion Impact |
|------|--------|----------|-----------------|---------------------------|------------------|
| G_BUILD_READY | **NOT_APPLICABLE** | No | N/A | Not a release evaluation | Non-blocking |
| G_RELEASE_SURFACE_PARITY | **NOT_APPLICABLE** | No | N/A | Not a release evaluation | Non-blocking |
| G_COST_ACCEPTABLE | **UNKNOWN** | No | No post-patch evaluation | Cost not evaluated | Non-blocking |
| G_LATENCY_ACCEPTABLE | **UNKNOWN** | No | No post-patch evaluation | Latency not evaluated | Non-blocking |

## SUMMARY
- **Total gates evaluated**: 12 mandatory + 4 optional
- **Mandatory gates passed**: 7/12
- **Mandatory gates failed**: 5/12
- **Blocking gates failed**: 4 (G_CRITICAL_CHAINS_PASS, G_ANTI_LIE_PASS, G_REGRESSION_NONE_ON_BLOCKING_AXES, G_PROOF_PACK_COMPLETE)
- **Additional blocking condition**: Truth status PARTIAL (not SEALED)

## BLOCKING GATES DETAIL

### G_CRITICAL_CHAINS_PASS = FAIL
- **Evidence**: Lane B: 0/8 items passed
- **Source**: ZERO_REGRESSION_AUTO_MODE (pre-patch evaluation)
- **Impact**: Critical chain failures indicate system reliability issues
- **Status after patch**: UNKNOWN (no post-patch evaluation)

### G_ANTI_LIE_PASS = FAIL
- **Evidence**: AV-07 (unproven_quality_labels), AV-08 (fabricated_conversation_history)
- **Source**: ZERO_REGRESSION_AUTO_MODE (pre-patch evaluation)
- **Impact**: Anti-lie violations indicate truthfulness regression
- **Status after patch**: AV-01 FIXED, AV-07 and AV-08 UNKNOWN (no post-patch evaluation)

### G_REGRESSION_NONE_ON_BLOCKING_AXES = FAIL
- **Evidence**: AV-07, AV-08 present in pre-patch evaluation
- **Source**: ZERO_REGRESSION_AUTO_MODE (pre-patch evaluation)
- **Impact**: Regression on truthfulness axis blocks promotion
- **Status after patch**: UNKNOWN (no post-patch evaluation)

### G_PROOF_PACK_COMPLETE = FAIL
- **Evidence**: No proof pack generated for candidate state
- **Source**: No post-patch evaluation exists
- **Impact**: Cannot verify candidate meets all requirements
- **Status**: BLOCKING until post-patch evaluation completed

## DECISION LOGIC APPLICATION
IF any blocking gate is FAIL/MISSING/UNKNOWN/PARTIAL → FINAL_UNIQUE_VERDICT = NO_PROMOTION

**Result**: 4 blocking gates FAIL → **NO_PROMOTION**