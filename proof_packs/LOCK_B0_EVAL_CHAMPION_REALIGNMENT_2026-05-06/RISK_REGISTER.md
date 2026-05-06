# Lock B0 — Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| New stubs have no champion — blocking dims cannot be scored yet | MEDIUM | Stubs are STUB_NO_CHAMPION status; B1 and subsequent locks do not require champion scores on B0 stubs |
| Existing 6 scorecard champions still at v28.0.0 | HIGH | Requires real eval run against current build to update — deferred, not B0 scope |
| CHALLENGER_TEMPLATE now has 18 score sections — eval scripts may need update | LOW | Template is additive; existing eval scripts only process keys they know; no regression |
| KEVIN_AXIS_SCORECARD has no external source reference | LOW | Intentional — TITANE-internal personal identity evaluation; documented in stub |
