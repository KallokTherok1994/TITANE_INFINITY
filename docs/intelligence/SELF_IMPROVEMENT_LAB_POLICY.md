# SELF_IMPROVEMENT_LAB_POLICY.md
# TITANE∞ — D4 Self-Improvement Lab: Policy Document
# Lock: D4 | Version: v15 | Status: SCAFFOLD ONLY

## Doctrine

> "Self-improvement proposes; it does not self-authorize."
>
> "Intelligence prouvée avant intelligence proclamée."

The Self-Improvement Lab is a **scaffold-only** capability. TITANE may detect patterns,
formulate hypotheses, and generate improvement proposals. It may never approve its own
proposals, merge its own code changes, or deploy modifications to production without
explicit human authorization.

---

## Approval Lifecycle

```
OBSERVED_WEAKNESS
    ↓
HYPOTHESIS
    ↓
PROPOSED  (patch generated — artifact only, is_applied=false always)
    ↓
SANDBOXED (isolated test environment — can_affect_production=false always)
    ↓
EVALUATED
    ↓
PROOF_READY
    ↓
APPROVAL_REQUIRED ← ← ← gate — explicit authorization required
    ↓
APPROVED_FOR_PROMOTION (only after explicit human approval)
    ↓
[promotion allowed — separate governed step]

At any stage: → REJECTED | EXPIRED | BLOCKED
```

---

## Invariants (non-negotiable)

| Rule | Description |
|------|-------------|
| NO_AUTO_MERGE | `blocksAutoMerge()` always returns `true`. No code change is merged by the lab. |
| NO_SELF_DEPLOY | `blocksSelfDeploy()` always returns `true`. No artifact is deployed by the lab. |
| CONFIDENCE_NOT_APPROVAL | A high confidence score does NOT constitute approval. `canPromote()` requires `approval_status === 'approved_for_promotion'`. |
| EVAL_IMPROVEMENT_NOT_APPROVAL | Measured eval improvement does NOT constitute approval. Approval is always explicit. |
| PATCH_IS_ARTIFACT | Generated patch proposals have `is_applied: false` (literal). They are artifacts, not applied changes. |
| SANDBOX_ISOLATION | `can_affect_production: false` (literal). Sandbox plans may never reach production. |
| APPROVAL_REQUIRED_ALWAYS | `requiresApproval()` returns `true` for every record. No exception. |

---

## Identity-Sensitive Proposals

Any proposal with `risk_level: 'identity_sensitive'` or `'restricted'` is flagged by
`isIdentitySensitiveProposal()` and **must reference the D3 Twin Consent Ledger**.

- Twin Consent Ledger D3 governs identity observation permissions.
- Identity-sensitive self-improvement proposals require explicit Twin Consent Ledger validation.
- `isIdentitySensitiveProposal()` returns `true` for `identity_sensitive` and `restricted` risk levels.

---

## Runtime-Sensitive Proposals

Any proposal with `risk_level: 'runtime_sensitive'`, `'security_sensitive'`, or `'restricted'`
is flagged by `isRuntimeSensitiveProposal()` and requires:

1. A feature flag guarding the change
2. A documented rollback plan

---

## Feature Flag

```
VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false  (default — PROD SAFE)
```

The lab is **inactive by default**. No detection, no proposal generation, no pipeline
advancement occurs unless this flag is explicitly set to `true`. Even when active, the
`apply` stage is permanently blocked in the scaffold.

---

## Known Limits (D4 T4 Scaffold)

1. **no-active-lab-by-default**: `VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false` until T4 activation
2. **no-auto-merge**: apply stage permanently blocked in scaffold
3. **no-self-deploy**: deployment never triggered by lab proposals
4. **confidence-not-approval**: confidence or eval improvement alone cannot approve promotion
5. **identity-sensitive-requires-twin-consent**: identity_sensitive proposals must reference Twin Consent Ledger D3
6. **runtime-sensitive-requires-flag-and-rollback**: runtime_sensitive proposals require feature flag + rollback doc

---

## Rollback

To disable D4 Self-Improvement Lab:

```bash
git restore src/services/self_improvement_lab
# Ensure VITE_TITANE_D4_SELF_IMPROVEMENT_LAB is unset or false (already default)
```

No production behavior is changed when this flag is false. Rollback is instant.

---

## Approval Authority

Self-improvement proposals may only be approved by the TITANE governance authority.
The lab itself may never approve, merge, or deploy its own proposals under any condition.

Lock: D4 | Next: D5 (Intelligence Seal)
