# WEEK2_DAILY_CHECK_TEMPLATE — OPS Monitoring Format

**Purpose:** Standardized daily checklist for Week 2 expansion monitoring

---

## Template Format (Use This Daily)

```markdown
## Daily Check — 2026-02-XX (Day N of Week 2)

**Date (UTC):** 2026-02-XX  
**Report Time:** HH:mm UTC  
**Week2 Day:** N / 7

### Tester Status
- **Active Testers:** X / 10 (T1–T10)
- **Sessions Today:** X hours cumulative
- **Participation Rate:** X%

### Incident Summary
- **P0 Incidents:** X (list if any)
- **P1 Incidents:** X (list if any)
- **Minor Issues:** X (list if any)

### Infrastructure
- **Drift Guard Status:** PASS / FAIL (verdict)
- **Dev Ports (4000, 5000):** CLEAR / FOUND
- **Git State:** CLEAN / DIRTY

### Decision
- **Today's Decision:** CONTINUE / PAUSE / ROLLBACK
- **Reason:** (if PAUSE or ROLLBACK)

### Notes
- (Tester feedback, if any)
- (Any qualitative observations)

---
```

## Key Rules

**DO:**
- Report factually (no speculation)
- Count only confirmed incidents
- Note "Not reported" if no data
- Keep entries short (1-2 lines per section)
- Append only (never edit prior days)

**DON'T:**
- Invent incident counts
- Exaggerate issues
- Include email addresses
- Make assumptions about drift
- Over-analyze qualitative feedback

---

## Example (Day 1 – 2026-02-25)

```markdown
## Daily Check — 2026-02-25 (Day 1 of Week 2)

**Date (UTC):** 2026-02-25  
**Report Time:** 06:00 UTC  
**Week2 Day:** 1 / 7

### Tester Status
- **Active Testers:** 10 / 10 (T1–T10)
- **Sessions Today:** ~8 hours cumulative
- **Participation Rate:** 100%

### Incident Summary
- **P0 Incidents:** 0
- **P1 Incidents:** 0
- **Minor Issues:** 0

### Infrastructure
- **Drift Guard Status:** PASS (NO DRIFT DETECTED)
- **Dev Ports (4000, 5000):** CLEAR
- **Git State:** CLEAN

### Decision
- **Today's Decision:** CONTINUE
- **Reason:** All testers online, no issues

### Notes
- Installation successful for all 10 testers
- Positive initial feedback from T5–T10

---
```

---

## Frequency

- **When:** Once per day, 06:00 UTC
- **Duration:** 7 days (2026-02-25 — 2026-03-03)
- **Total Entries:** 7 daily checks
- **Format:** Append-only (immutable log)

---

**Template Effective:** 2026-02-25  
**Last Updated:** 2026-02-24T23:40:00Z
