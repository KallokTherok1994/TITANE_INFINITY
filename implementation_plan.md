# Implementation Plan — P4.9 External Reentry / Final Seal Trigger Router

## [Overview]

Single sentence: Execute P4.9 cycle to audit prior locks, detect reentry triggers, classify actionability, and produce honest hold verdict with proof pack.

This cycle is the P4.9 external reentry / final seal trigger router. Based on P4.8 TERMINAL_HOLD_CLASSIFIED verdict at HEAD 9488cc15d, this cycle must verify that all previously claimed locks remain stable, detect whether any real reentry trigger appeared since P4.8, classify actionability for E0/G1.5/G2/G3/F, route to exactly one lane (HOLD_PRESERVATION if no trigger), execute only one real lock or preserve hold honestly, and emit one exact verdict.

Current state: HEAD 9488cc15d, MAIN branch, v28.88.0, worktree clean (only untracked proof_packs and implementation_plan.md). External sync chain suspended (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, OPTION1_SYNC_ENABLED all absent). No reentry triggers detected. Expected lane: A (HOLD_PRESERVATION).

## [Types]

No type system changes required. This is a governance/audit cycle, not a product mutation.

## [Files]

Detailed breakdown:

### New files to create

- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/00_EXEC_SUMMARY.md` — Executive summary
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/01_BOOTSTRAP.md` — Bootstrap truth
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/02_WORKTREE_BASELINE_MAP.md` — Worktree + baseline
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/03_PRIOR_LOCK_COMPLETION_MAP.md` — Lock audit
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/04_REENTRY_TRIGGER_MAP.md` — Trigger detection
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/05_ACTIONABILITY_MATRIX.md` — Family classification
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/06_ACTIVE_ROUTER_MAP.md` — Lane selection
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/07_ACTIVE_PHASE_SPEC.md` — H0 spec
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/08_PROOF_SCENARIOS.md` — Proof scenarios
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/09_ALIGNMENT_OR_FIXES.md` — Fixes
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/10_X3_RUNS.md` — Baseline x3
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/11_MERMAID.md` — Mermaid
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/12_REGISTRY_APPEND.md` — Registry
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/13_AUTOHEAL_UPDATE.md` — AutoHeal
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/14_GATES_REPORT.md` — Gates
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/15_DIFF_FILES.md` — Diff
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/16_ROLLBACK.md` — Rollback
- `proof_packs/POST_P4_9_HOLD_PRESERVATION_2026-03-30_HHMM_9488cc15d/17_VERDICT.md` — Verdict

### Files to NOT modify

- No source code, config, or workflow changes

## [Functions]

No function modifications.

## [Classes]

No class modifications.

## [Dependencies]

No dependency changes.

## [Testing]

Baseline commands: cargo test --lib, verify_instructions.sh, pnpm run check, cargo check --lib (x3 each)

## [Implementation Order]

1. Bootstrap verification
2. Prior lock completion audit
3. Reentry trigger detection
4. Actionability filter
5. Lane selection (A=HOLD_PRESERVATION)
6. Baseline commands x3
7. Hold state validation
8. Gates evaluation
9. Proof pack generation
10. Final verdict
