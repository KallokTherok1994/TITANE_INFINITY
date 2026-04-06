# SUPPORT_CAPACITY_MODEL.md

Timestamp: 2026-02-17T23:59:53Z

Inputs:
- Avg response time target: <= 4h
- Support load per 10 users: 1-2 tickets/day (estimate)
- Max testers supportable without burnout: 50 (baseline assumption)

Rules:
- If avg response time > 8h for 2 consecutive days, pause growth
- If ticket backlog > 2x baseline, pause new cohorts
- If P0 incident occurs, shift all support to incident handling

Assumptions must be validated with Week 2 data before public RC.
