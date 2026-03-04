# INCIDENT_ESCALATION_MATRIX.md

Timestamp: 2026-02-17T23:59:53Z

Level | Definition | Action | Timing
----- | ---------- | ------ | ------
P0 | Crash, data loss, security issue | Immediate rollback + freeze expansion | 0-15 min
P1 | Major feature outage | Patch within 24h; pause expansion if repeated | <= 24h
Minor | Non-blocking defects | Next maintenance window | Scheduled

No ambiguity:
- P0 always triggers rollback and stop-the-line
- P1 repeated in 24h triggers pause and review
