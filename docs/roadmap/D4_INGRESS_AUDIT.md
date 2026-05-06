# D4_INGRESS_AUDIT.md
# TITANE∞ — D4 Self-Improvement Lab: Ingress Audit
# Date: 2026-05-06 | Lock: D4 | Version: v15

## Classification: D4_PARTIAL_COMMITTED → D4_NORMALIZED

The ingress audit was performed on 2026-05-06. The base D4 contract existed with
45 tests (T4 scaffold pipeline). The v15 sidecar (approval-gated lifecycle with
SelfImprovementLabRecord, policy helpers, D4-UNIT-01..10) was missing and was
added in this session.

---

## Pre-Normalization State

| Surface | Status |
|---------|--------|
| `src/services/self_improvement_lab/SelfImprovementLabContract.ts` | PRESENT (base, 221 lines) |
| `src/services/self_improvement_lab/__tests__/SelfImprovementLabContract.test.ts` | PRESENT (base, 45 tests) |
| v15 sidecar schemas (SelfImprovementLabRecord, etc.) | MISSING |
| Policy helpers (canPromote, blocksAutoMerge, etc.) | MISSING |
| D4-UNIT-01..10 tests | MISSING |
| `docs/intelligence/SELF_IMPROVEMENT_LAB_POLICY.md` | MISSING |
| `docs/intelligence/SELF_IMPROVEMENT_LAB_SCHEMA.md` | MISSING |
| `scripts/verify/verify_self_improvement_lab.sh` | MISSING |
| `REG-AI-D4` in ADVANCED_INTELLIGENCE_REGISTRY | MISSING |
| `TREG-015` in TEST_REGISTRY | MISSING |
| AutoHeal LOCK_D4 entry | MISSING |
| Proof pack LOCK_D4_SELF_IMPROVEMENT_LAB_2026-05-06 | MISSING |
| `AI-DESKTOP-16` | PRESENT (PLANNED) |
| `FF-D4` in RUNTIME_FEATURE_FLAGS | PRESENT |

---

## D4 Doctrine

> "Self-improvement proposes; it does not self-authorize."

The D4 Self-Improvement Lab defines a scaffold for TITANE's autonomous improvement
capability. It enables detection, hypothesis, proposal, sandbox, and evaluation —
but the apply stage is permanently blocked until explicit T4 activation. Even then,
no self-approval, no auto-merge, and no self-deploy is possible.

---

## Post-Normalization State

| Surface | Status |
|---------|--------|
| Contract (v15 sidecar) | ADDED — SelfImprovementLabRecord, 12 states, 5 promotion statuses, 7 risk levels, 11 policy helpers |
| Tests | PASS=122/122 (45 base + 77 v15 sidecar + D4-UNIT-01..10) |
| `docs/intelligence/SELF_IMPROVEMENT_LAB_POLICY.md` | CREATED |
| `docs/intelligence/SELF_IMPROVEMENT_LAB_SCHEMA.md` | CREATED |
| `scripts/verify/verify_self_improvement_lab.sh` | CREATED (25 checks) |
| `REG-AI-D4` in ADVANCED_INTELLIGENCE_REGISTRY | ADDED |
| `TREG-015` in TEST_REGISTRY | ADDED |
| `AI-DESKTOP-16` in DESKTOP_E2E_REGISTRY | PRESENT (PLANNED) |
| AutoHeal LOCK_D4 entry | ADDED |
| Proof pack LOCK_D4_SELF_IMPROVEMENT_LAB_2026-05-06 | CREATED |

---

## Key Constraints Confirmed

- `blocksAutoMerge()` always returns `true` (D4-UNIT-08 validated)
- `blocksSelfDeploy()` always returns `true` (D4-UNIT-09 validated)
- `canPromote()` returns `false` without `approved_for_promotion` status (D4-UNIT-02 validated)
- `confidence` alone cannot approve promotion (D4-UNIT-03 validated)
- `eval_improvement` alone cannot approve promotion (D4-UNIT-04 validated)
- `is_applied: false` (literal) on all patches (D4-UNIT-05 validated)
- `identity_sensitive` proposals detected, Twin Consent Ledger D3 referenced (D4-UNIT-06)
- `runtime_sensitive` proposals detected, feature flag + rollback required (D4-UNIT-07)
- `VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false` (default, PROD SAFE)

---

## AI-DESKTOP-16 Status

AI-DESKTOP-16 ("Self-improvement requires approval") is in `TITANE_DESKTOP_E2E_REGISTRY.md`
as **PLANNED** (pending D4 desktop lane). Full E2E lane is blocked until a self-improvement
UI surface exists. This is honest — no fake SCAFFOLDED status.

---

## Gate Results (Session 2026-05-06)

```
verify_self_improvement_lab.sh: PASS=25 FAIL=0
detect_recurrence.sh: PASS
verify_instructions.sh: PASS
vitest self_improvement_lab: 122/122 PASS
```

Lock: D4 | Next: D5 (Intelligence Seal — already CLEAN)
