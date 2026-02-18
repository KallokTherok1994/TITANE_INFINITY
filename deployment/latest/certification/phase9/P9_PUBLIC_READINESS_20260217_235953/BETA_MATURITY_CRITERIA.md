# BETA_MATURITY_CRITERIA.md

Timestamp: 2026-02-17T23:59:53Z
Purpose: define objective thresholds before public release candidate

Minimum requirements before public:
- 14 consecutive days with zero P0 incidents
- Drift anomalies = 0
- Dev ports detections = 0
- Crash-free rate >= 99.9%
- 50+ cumulative runtime days
- >= 8 concurrent testers validated
- Rollback tested within last 7 days

Evidence sources (append-only):
- P8 daily checks + incident logs
- Drift guard logs
- Support reports (ops)
- Rollback test record
