# 02 — SCOPE
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

---

## Mission

Build a permanent anti-regression architecture for TITANE∞.
Transform TITANE from "a system that changes" into "a governed system that can only promote changes when proven non-regressive and beneficial."

## Scope Boundaries

### IN SCOPE
- Governance infrastructure: `evals/` scaffold creation
- Discovery documents: agent inventory, critical chains, champion baseline, challenger surfaces, gap matrix
- Versioned scorecards (JSON): 6 required scorecards
- Versioned datasets: 6 eval lanes
- Gate script: `scripts/verify/verify_evals_scaffold.sh`
- AutoHeal entry for `MISSING_EVAL_INFRASTRUCTURE`
- Single real lock identification and minimal fix

### OUT OF SCOPE (this session)
- Runtime eval execution (BLOCKED_BY_ENV: Node v18 incompatibility)
- Modifying src/ production code
- Modifying src-tauri/ production code
- E2E test execution
- Provider/routing/memory logic changes

## Ring Impact

| Ring | Layer         | Touch | Type            |
|------|---------------|-------|-----------------|
| 1    | Domain/Types  | NO    | —               |
| 2    | Services/IPC  | NO    | —               |
| 3    | Core/Config   | YES   | scripts/verify/ |
| 4    | UI/OS/Desktop | NO    | —               |

New files only. No modifications to existing production code.

## Files Added (expected)
- `evals/README.md`
- `evals/datasets/v1/*.jsonl` (6 lane datasets + DATASET_INDEX.md)
- `evals/scorecards/v1/*.json` (6 scorecards)
- `evals/rubrics/v1/*.md` (2 rubrics)
- `evals/baselines/v1/champion_baseline.json`
- `scripts/verify/verify_evals_scaffold.sh`
- `scripts/autoheal/autoheal_rules.jsonl` (1 entry appended)
- `proof_packs/ZERO_REGRESSION_2026-03-20_1430_7973fbd/*.md` (22 files)
