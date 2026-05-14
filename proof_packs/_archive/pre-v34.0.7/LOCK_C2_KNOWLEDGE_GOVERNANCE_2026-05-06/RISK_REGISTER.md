# Lock C2 — Knowledge Governance — Risk Register

## Active Risks

| id | risk | severity | likelihood | mitigation | status |
|---|---|---|---|---|---|
| C2-RISK-01 | Knowledge content accidentally modified | CRITICAL | LOW | Invariant enforced: data/knowledge_base/default/ never touched by any C2 operation; KNOWLEDGE_GOVERNANCE_INDEX.json is a separate file | MITIGATED |
| C2-RISK-02 | High-risk domain (legal/medical/financial/safety) entries lack `not_allowed_use` | HIGH | LOW | `highRiskDomainRequiresNotAllowedUse()` policy function enforces this; validator check 9 verifies all 4 high-risk domains in index | MITIGATED |
| C2-RISK-03 | `spiritual_symbolic` domain entry marked `verified` | HIGH | LOW | `spiritualSymbolicIsInterpretive()` policy function rejects `verified` status; validator check 10; kb-spirit-001 seed entry is `curated` | MITIGATED |
| C2-RISK-04 | `time_sensitive` entry without `requires_web_validation: true` | MEDIUM | LOW | `requiresWebValidationForTimeSensitive()` function enforces; validator check 6; all 4 time_sensitive seed entries have requires_web_validation=true | MITIGATED |
| C2-RISK-05 | `public` + `verified` entry with no URL or date | MEDIUM | LOW | `publicSourceCannotBeVerifiedWithoutEvidence()` function enforces; validator check 7 | MITIGATED |
| C2-RISK-06 | `generated` content marked `verified` without review notes | MEDIUM | LOW | `generatedSourceCannotBeVerifiedWithoutReview()` function enforces; no generated entries in current seed | MITIGATED |
| C2-RISK-07 | Governance index covers missing required domain | MEDIUM | MEDIUM | `governanceIndexContainsRequiredDomains()` function enforces 8 domains; validator check 12; all 8 required domains present in seed | MITIGATED |
| C2-RISK-08 | Registry drift (REGISTRY.md not updated) | LOW | LOW | All 5 registries updated in C2 normalization; verify_advanced_intelligence_registry.sh gate | MITIGATED |
| C2-RISK-09 | AI-DESKTOP-08 never executed | LOW | MEDIUM | Blocked on E0 desktop execution authority (known blocker, not C2 responsibility); SCAFFOLDED status accurate | ACCEPTED / E0 BLOCKER |

## Accepted Residual Risk

- C2-RISK-09: AI-DESKTOP-08 execution pending E0. The lane is SCAFFOLDED and the contract is proven (77 tests). E2E execution is blocked by external prerequisite.

## Cleared Risks (Not Materialized)

- Any risk of sidecar schema breaking existing 41 tests: confirmed zero regressions (77/77 PASS after additive extension).
