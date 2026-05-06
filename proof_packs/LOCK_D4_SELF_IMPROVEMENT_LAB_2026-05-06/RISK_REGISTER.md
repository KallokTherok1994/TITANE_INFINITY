# Lock D4 — Self-Improvement Lab — RISK REGISTER

## Risks Identified and Mitigated

| Risk ID | Description | Level | Mitigation | Status |
|---------|-------------|-------|-----------|--------|
| RISK-D4-01 | Lab proposal could be mistakenly treated as applied patch | HIGH | `is_applied: literal(false)` schema enforcement; D4-UNIT-05 | MITIGATED |
| RISK-D4-02 | Confidence score used as approval proxy | HIGH | `canPromote` requires `approved_for_promotion` gate; D4-UNIT-03 | MITIGATED |
| RISK-D4-03 | Eval improvement used as approval proxy | HIGH | `canPromote` independent of eval scores; D4-UNIT-04 | MITIGATED |
| RISK-D4-04 | Auto-merge triggered by lab | CRITICAL | `blocksAutoMerge()` always returns `true`; D4-UNIT-08 | MITIGATED |
| RISK-D4-05 | Self-deploy triggered by lab | CRITICAL | `blocksSelfDeploy()` always returns `true`; D4-UNIT-09 | MITIGATED |
| RISK-D4-06 | Identity-sensitive proposal bypasses Twin Consent Ledger | HIGH | `isIdentitySensitiveProposal()` + D4 known limits + D4-UNIT-06 | MITIGATED |
| RISK-D4-07 | Runtime-sensitive proposal lacks feature flag | MEDIUM | `isRuntimeSensitiveProposal()` + known limits + D4-UNIT-07 | MITIGATED |
| RISK-D4-08 | Lab becomes active in production by default | HIGH | `VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false` (default) | MITIGATED |
| RISK-D4-09 | Sandbox plan affects production | HIGH | `can_affect_production: literal(false)` | MITIGATED |
| RISK-D4-10 | Approval gate allows auto-approval | HIGH | `auto_approved: literal(false)` in schema | MITIGATED |

## Residual Risks

| Risk | Description | Next Action |
|------|-------------|-------------|
| RES-D4-01 | AI-DESKTOP-16 full E2E lane not yet implemented | Blocked until self-improvement UI surface exists; honest PLANNED status |
| RES-D4-02 | No Rust integration for self-improvement detection | By design — T4 scaffold only; Rust wiring would require D5 or beyond |

Date: 2026-05-06 | Lock: D4
