# Lock D4 — Self-Improvement Lab — SELF_IMPROVEMENT_AUDIT

## D4 Self-Improvement Capability Assessment

### What Exists (Scaffold)

| Capability | Status | Notes |
|------------|--------|-------|
| Weakness detection | SCAFFOLD | `detectImprovement()` flag-gated |
| Hypothesis generation | SCAFFOLD | `SelfImprovementHypothesisSchema` defined |
| Patch proposal | SCAFFOLD | `SelfImprovementPatchProposalSchema`, is_applied=false |
| Sandbox planning | SCAFFOLD | `SelfImprovementSandboxPlanSchema`, can_affect_production=false |
| Eval before/after | SCAFFOLD | `SelfImprovementEvalSnapshotSchema` defined |
| Eval comparison | SCAFFOLD | `canCompareEvals()` gated to evaluated/proof_ready |
| Approval gate | SCAFFOLD | `SelfImprovementApprovalGateSchema`, auto_approved=false |
| Promotion | SCAFFOLD | `canPromote()` requires explicit approval_for_promotion |
| Summary | SCAFFOLD | `buildSelfImprovementSummary()` with invariant fields |

### What Is Blocked (T4 Safety)

| Block | Mechanism | Invariant |
|-------|-----------|-----------|
| Apply stage | `advancePipelineStage()` blocks at approve | T4 scaffold permanent |
| Auto-merge | `blocksAutoMerge()` returns `true` always | Constitutional |
| Self-deploy | `blocksSelfDeploy()` returns `true` always | Constitutional |
| Confidence approval | `canPromote()` ignores confidence | Constitutional |
| Eval-alone approval | `canPromote()` ignores eval scores | Constitutional |
| Auto-approval | `auto_approved: literal(false)` | Schema-enforced |
| Production sandbox | `can_affect_production: literal(false)` | Schema-enforced |

### Known Limits

1. No active lab by default (VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false)
2. No auto-merge (apply stage permanently blocked)
3. No self-deploy (never triggered by proposals)
4. Confidence is a signal — not an approval
5. Identity-sensitive proposals require Twin Consent Ledger D3
6. Runtime-sensitive proposals require feature flag + rollback doc

Date: 2026-05-06 | Lock: D4
