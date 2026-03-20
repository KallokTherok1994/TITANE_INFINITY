# TITANE∞ — Eval Infrastructure

## Version: v1.0 | Date: 2026-03-20 | Champion: 7973fbdec (v28.0.0)

---

## Purpose

This directory contains the governed anti-regression evaluation infrastructure for TITANE∞.

No change to prompts, agents, routing, memory, or providers may be promoted without passing the relevant lanes here.

---

## Directory Structure

```
evals/
├── README.md                    ← this file
├── datasets/
│   └── v1/
│       ├── DATASET_INDEX.md
│       ├── lane_a_golden_tasks.jsonl
│       ├── lane_b_critical_chains.jsonl
│       ├── lane_c_regression.jsonl
│       ├── lane_d_honesty.jsonl
│       ├── lane_e_stability.jsonl
│       └── lane_f_shadow.jsonl
├── scorecards/
│   └── v1/
│       ├── RESPONSE_QUALITY_SCORECARD.json
│       ├── MEMORY_TRUTH_SCORECARD.json
│       ├── ROUTER_TRUTH_SCORECARD.json
│       ├── HONESTY_SCORECARD.json
│       ├── AUTOHEAL_TRUTH_SCORECARD.json
│       └── DESKTOP_CRITICAL_FLOW_SCORECARD.json
├── rubrics/
│   └── v1/
│       ├── response_quality_rubric.md
│       └── honesty_rubric.md
├── baselines/
│   └── v1/
│       └── champion_baseline.json
└── reports/
    └── (eval run reports go here, append-only)
```

---

## Eval Lanes

| Lane | Name                 | Goal                                            |
| ---- | -------------------- | ----------------------------------------------- |
| A    | Golden Task Evals    | Prove core TITANE tasks do not regress          |
| B    | Critical Chain Evals | Prove each runtime chain still works            |
| C    | Regression Evals     | Compare challenger vs champion on same dataset  |
| D    | Safety/Honesty Evals | Fail if TITANE becomes more misleading          |
| E    | Stability X3         | Prove repeatability (3 reruns)                  |
| F    | Shadow Observation   | Allow bounded experimentation without promotion |

---

## Champion/Challenger Rules

1. CHAMPION = current stable baseline (v28.0.0 / 7973fbdec)
2. CHALLENGER = any proposed change to prompts, routing, memory, agents, tools
3. A challenger MAY run in shadow mode without promotion
4. A challenger MAY NOT replace champion unless ALL blocking gates PASS
5. If any blocking regression: PROMOTION_BLOCKED, champion retained
6. Rollback target = always previous champion commit

---

## Promotion Gate Summary

Mandatory: G_BOOT_TRUTH, G_DISCOVERY_TRUTH, G_CHAMPION_BASELINE_DEFINED,
G_EVAL_DATASET_VERSIONED, G_SCORECARDS_PRESENT, G_CRITICAL_CHAINS_PASS,
G_HONESTY_NO_REGRESSION, G_MEMORY_NO_REGRESSION, G_ROUTER_NO_REGRESSION,
G_AUTOHEAL_NO_MASKING, G_DESKTOP_CRITICAL_FLOW_NO_REGRESSION,
G_X3_STABILITY, G_ROLLBACK_READY, G_PROOF_PACK_COMPLETE

Gate script: `bash scripts/verify/verify_evals_scaffold.sh`

---

## Version Policy

- Dataset versions: `datasets/v1/`, `datasets/v2/`, etc. Never silently overwrite.
- Scorecard versions: `scorecards/v1/`, `scorecards/v2/`, etc.
- Baseline versions: `baselines/v1/champion_baseline.json`, etc.
- Reports: append-only under `reports/`

---

## Environment Requirements

- Node.js >= 20.0.0 (for JS-based eval runners)
- pnpm >= 10 (for test execution)
- Current status: Node v18.19.1 → **BLOCKED_BY_ENV** for JS eval execution
  - Install: `nvm install 20 && nvm use 20`
  - Scaffold and scorecard files can be created and validated without Node.
