# D3 Risk Register

| Risk | Level | Mitigation |
|------|-------|------------|
| Identity observation activated without Kevin validation | HIGH | `VITE_TITANE_D3_IDENTITY_OBSERVATION_ACTIVE=false` default; policy helpers enforce `requires_kevin_validation` before any activation |
| Confidence score treated as consent proxy | HIGH | `canAffectBehavior/Memory/Identity` explicitly check `validation_status=confirmed`; `buildTwinConsentSummary` always returns `confidence_not_consent_enforced=true` |
| symbolic_axis hypothesis used as fact | HIGH | `isIdentitySensitive` returns true for symbolic_axis; `canAffectIdentity` returns false unless confirmed |
| behavioral_instruction alters style without validation | HIGH | `requiresKevinValidation` returns true for behavioral_instruction; gate enforced in policy helpers |
| Rejected observation reactivated | MEDIUM | `isRejectedOrBlocked` gate; `canAffect*` helpers check `BLOCKING_STATUSES` |
| Expired observation triggers behavior | MEDIUM | `isExpiredObservation` checks `expires_at`; `canAffect*` helpers check expiry |
| No Rust wiring (limit) | LOW | Documented in known_limits[1]; D4 dependency explicit |
| AI-DESKTOP-13 not fully E2E tested | LOW | Status SCAFFOLDED (honest); full E2E lane blocked until D4 + identity observation Rust integration |
