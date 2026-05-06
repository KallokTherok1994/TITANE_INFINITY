# Twin Consent Ledger — Schema Reference

**Lock:** D3  
**Version:** v13 Identity Observation Sidecar

---

## TwinIdentityObservationEntry (21 fields)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `observation_id` | string | ✓ | Unique identifier |
| `subject_id` | string | ✓ | Session hash or subject identifier |
| `observation_type` | TwinObservationType | ✓ | See below |
| `content` | string | ✓ | Observation text |
| `source` | string | ✓ | Origin of observation |
| `source_ref` | string? | — | Optional reference |
| `confidence` | number (0–1) | ✓ | Signal strength — NOT a consent proxy |
| `auto_detected` | boolean | ✓ | True if system-inferred |
| `requires_validation` | boolean | ✓ | Must be true for identity-sensitive |
| `validation_status` | TwinValidationStatus | ✓ | See below |
| `validated_by` | string\|null | ✓ | null until validated |
| `validated_at` | string\|null | ✓ | ISO timestamp or null |
| `can_affect_behavior` | boolean | ✓ | Subject to canAffectBehavior() gate |
| `can_affect_memory` | boolean | ✓ | Subject to canAffectMemory() gate |
| `can_affect_identity` | boolean | ✓ | Subject to canAffectIdentity() gate |
| `expires_at` | string\|null | ✓ | ISO timestamp or null |
| `rejected_reason` | string\|null | ✓ | Reason when status=rejected |
| `risk_level` | TwinConsentRiskLevel | ✓ | See below |
| `linked_memory_node_ids` | string[] | ✓ | Graph link IDs |
| `notes` | string? | — | Optional annotation |
| `created_at` | string | ✓ | ISO timestamp |
| `updated_at` | string | ✓ | ISO timestamp |

---

## TwinObservationType (11 values)

| Value | Identity-Sensitive | Notes |
|-------|--------------------|-------|
| `identity_fact` | ✓ | Hard identity claim — Kevin validation required |
| `preference` | — | User working preference |
| `value` | ✓ | Ethical/personal value — Kevin validation required |
| `constraint` | — | Stated constraint or limit |
| `symbolic_axis` | ✓ | Interpretive axis — hypothesis unless confirmed |
| `emotional_pattern` | ✓ | Emotional signal — Kevin validation required |
| `project_context` | — | Project-scoped context |
| `memory_policy` | — | Memory handling instruction |
| `behavioral_instruction` | ✓ | Style/behavior directive — Kevin validation required |
| `risk_signal` | — | Risk or anomaly signal |
| `unknown` | — | Unclassified observation |

---

## TwinValidationStatus (8 values)

| Value | Can affect behavior? | Can affect identity? | Notes |
|-------|---------------------|---------------------|-------|
| `hypothesis` | ✗ | ✗ | Unverified, no activation |
| `requires_kevin_validation` | ✗ | ✗ | Blocked pending Kevin review |
| `confirmed` | ✓ (if other gates pass) | ✓ (if other gates pass) | Fully validated |
| `rejected` | ✗ | ✗ | Permanently inert |
| `expired` | ✗ | ✗ | Time-limited, now inert |
| `system_observed` | ✗ | ✗ | Logging only |
| `blocked` | ✗ | ✗ | Governance block |
| `unknown` | ✗ | ✗ | Unresolved state |

---

## TwinConsentRiskLevel (5 values)

| Value | Identity gate impact |
|-------|--------------------|
| `low` | Standard gates apply |
| `medium` | Standard gates apply |
| `high` | Standard gates apply, monitoring recommended |
| `identity_sensitive` | Triggers `requiresKevinValidation=true` |
| `restricted` | Blocks `canAffectIdentity` permanently |

---

## Policy Helpers

| Helper | Returns | Confidence sufficient? |
|--------|---------|----------------------|
| `requiresKevinValidation(entry)` | boolean | No |
| `canAffectBehavior(entry)` | boolean | No — must be confirmed |
| `canAffectMemory(entry)` | boolean | No — must be confirmed |
| `canAffectIdentity(entry)` | boolean | No — must be confirmed + not restricted |
| `isIdentitySensitive(entry)` | boolean | N/A |
| `isExpiredObservation(entry)` | boolean | N/A |
| `isRejectedOrBlocked(entry)` | boolean | N/A |
| `normalizeAutoDetectedObservation(entry)` | TwinIdentityObservationEntry | N/A |
| `buildTwinConsentSummary(entries)` | TwinConsentSummary | N/A |

---

## D3_TWIN_IDENTITY_OBSERVATION_CONTRACT

```typescript
{
  schema: 'D3_TWIN_IDENTITY_OBSERVATION_CONTRACT_V1',
  active: false,  // default=false, env-driven
  policy: 'confidence-not-consent; validation-required-before-identity-activation',
  known_limits: [...],  // 5 limits
  observation_types: 11,
  validation_statuses: 8,
  risk_levels: 5,
  twin_rule: 'Twin remains a mirror, not an authority',
}
```
