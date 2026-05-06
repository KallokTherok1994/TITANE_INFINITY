# SELF_IMPROVEMENT_LAB_SCHEMA.md
# TITANE∞ — D4 Self-Improvement Lab: Schema Reference
# Lock: D4 | Version: v15 | Status: SCAFFOLD ONLY

## Contract File

`src/services/self_improvement_lab/SelfImprovementLabContract.ts`

---

## Enums

### `ImprovementState` (12 values)

```
observed | hypothesis | proposed | sandboxed | evaluated |
proof_ready | approval_required | approved | rejected | expired |
blocked | unknown
```

### `PromotionStatus` (5 values)

```
not_promotable | approval_required | approved_for_promotion | rejected | blocked
```

### `ImprovementRiskLevel` (7 values)

```
low | medium | high | identity_sensitive | runtime_sensitive | security_sensitive | restricted
```

### `ImprovementDomain` (5 values — T4 base)

```
response_quality | reasoning_accuracy | knowledge_gap | latency_optimization | prompt_calibration
```

### `PipelineStage` (5 values — T4 base)

```
detect | propose | evaluate | approve | apply
```

---

## Core Schemas

### `SelfImprovementWeaknessSchema`

| Field | Type | Notes |
|-------|------|-------|
| `weakness_id` | `string` | Unique ID |
| `domain` | `ImprovementDomain` | Which domain |
| `description` | `string (min 1)` | Human-readable description |
| `observed_at` | `string` | ISO timestamp |
| `severity` | `'low' \| 'medium' \| 'high'` | Severity classification |
| `evidence` | `string \| null` | Supporting evidence or null |

### `SelfImprovementHypothesisSchema`

| Field | Type | Notes |
|-------|------|-------|
| `hypothesis_id` | `string` | Unique ID |
| `weakness_id` | `string` | Reference to weakness |
| `hypothesis_text` | `string (min 1)` | Hypothesis description |
| `confidence` | `number [0, 1]` | Signal strength — NOT a promotion proxy |
| `requires_sandbox` | `boolean` | Whether sandbox run is needed |
| `created_at` | `string` | ISO timestamp |

### `SelfImprovementPatchProposalSchema`

| Field | Type | Notes |
|-------|------|-------|
| `patch_id` | `string` | Unique ID |
| `hypothesis_id` | `string` | Reference to hypothesis |
| `patch_description` | `string (min 1)` | Proposed change description |
| `affected_paths` | `string[]` | Paths affected |
| `is_applied` | `literal(false)` | **Always false** — proposals are artifacts |
| `risk_level` | `ImprovementRiskLevel` | Risk classification |
| `requires_approval` | `boolean` | Always true in practice |
| `approval_status` | `PromotionStatus` | Current status |
| `created_at` | `string` | ISO timestamp |

### `SelfImprovementSandboxPlanSchema`

| Field | Type | Notes |
|-------|------|-------|
| `sandbox_id` | `string` | Unique ID |
| `patch_id` | `string` | Reference to patch |
| `environment` | `'unit' \| 'integration' \| 'isolated_e2e'` | Env type |
| `isolation_confirmed` | `boolean` | Isolation verified |
| `can_affect_production` | `literal(false)` | **Always false** |
| `planned_at` | `string` | ISO timestamp |

### `SelfImprovementEvalSnapshotSchema`

| Field | Type | Notes |
|-------|------|-------|
| `eval_id` | `string` | Unique ID |
| `patch_id` | `string` | Reference to patch |
| `timing` | `'before' \| 'after'` | Eval timing |
| `score` | `number [0, 1]` | Overall score |
| `metrics` | `Record<string, number>` | Per-metric scores |
| `taken_at` | `string` | ISO timestamp |

### `SelfImprovementApprovalGateSchema`

| Field | Type | Notes |
|-------|------|-------|
| `gate_id` | `string` | Unique ID |
| `patch_id` | `string` | Reference to patch |
| `approval_status` | `PromotionStatus` | Current approval status |
| `approved_by` | `string \| null` | Approver identity |
| `approved_at` | `string \| null` | Approval timestamp |
| `rejected_reason` | `string \| null` | Rejection reason |
| `auto_approved` | `literal(false)` | **Always false** — no auto-approval |
| `proof_pack_required` | `boolean` | Whether proof pack needed |
| `has_proof_pack` | `boolean` | Whether proof pack exists |

### `SelfImprovementLabRecordSchema`

| Field | Type | Notes |
|-------|------|-------|
| `record_id` | `string` | Unique record ID |
| `weakness` | `SelfImprovementWeakness` | Root weakness |
| `hypothesis` | `SelfImprovementHypothesis \| null` | Generated hypothesis |
| `patch_proposal` | `SelfImprovementPatchProposal \| null` | Generated patch |
| `sandbox_plan` | `SelfImprovementSandboxPlan \| null` | Sandbox plan |
| `approval_gate` | `SelfImprovementApprovalGate \| null` | Approval gate |
| `state` | `ImprovementState` | Current lifecycle state |
| `risk_level` | `ImprovementRiskLevel` | Risk classification |
| `created_at` | `string` | ISO timestamp |
| `updated_at` | `string` | ISO timestamp |

---

## Policy Helpers

| Helper | Signature | Behavior |
|--------|-----------|----------|
| `requiresApproval(record)` | `→ true` | Always `true` — no auto-approval ever |
| `canGenerateProposal(record)` | `→ boolean` | `true` for `observed` or `hypothesis` state |
| `canRunSandbox(record)` | `→ boolean` | `true` for `proposed` or `sandboxed` state |
| `canCompareEvals(record)` | `→ boolean` | `true` for `evaluated` or `proof_ready` state |
| `canPromote(record)` | `→ boolean` | `true` only if `approval_status === 'approved_for_promotion'` and non-blocking state |
| `isIdentitySensitiveProposal(record)` | `→ boolean` | `true` for `identity_sensitive` or `restricted` risk |
| `isRuntimeSensitiveProposal(record)` | `→ boolean` | `true` for `runtime_sensitive`, `security_sensitive`, `restricted` |
| `hasRequiredProof(record)` | `→ boolean` | `true` if gate exists and `has_proof_pack=true` |
| `blocksAutoMerge(record)` | `→ true` | **Always `true`** |
| `blocksSelfDeploy(record)` | `→ true` | **Always `true`** |
| `buildSelfImprovementSummary(records)` | `→ SelfImprovementSummary` | Counts by state, risk, invariants |

---

## Contract Metadata

```typescript
D4_SELF_IMPROVEMENT_LAB_CONTRACT = {
  schema: 'D4_SELF_IMPROVEMENT_LAB_CONTRACT_V15',
  active: false,                    // default=false, PROD SAFE
  approval_required: true,          // invariant
  auto_merge_blocked: true,         // invariant
  self_deploy_blocked: true,        // invariant
  policy: 'self-improvement-proposes; it-does-not-self-authorize',
  known_limits: [...],              // 6 limits
  improvement_states: 12,
  promotion_statuses: 5,
  risk_levels: 7,
}
```

## Feature Flag

```
VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false  (default — PROD SAFE)
```

Lock: D4 | Next: D5 (Intelligence Seal)
