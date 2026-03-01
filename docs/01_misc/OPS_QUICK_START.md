# 🎯 P8.4 WEEK 2 EXPANSION: QUICK START GUIDE

**Status:** ✅ READY FOR WEEK 2 LAUNCH (2026-02-25 06:00 UTC)

---

## Quick Facts

| Aspect | Details |
|--------|---------|
| **Phase** | P8.4 Week 2 Expansion |
| **Duration** | 7 days (2026-02-25 to 2026-03-03) |
| **Cohort** | 10 testers (T1–T10: 4 continuants + 6 new) |
| **Binary** | v27.0.0 TitanStable (ZERO mutations) |
| **Channels** | A (primary) + B (fallback, manual-only) |
| **Proof Pack** | 9 files, 57 KB, 1,267 lines |
| **Gates Status** | 5/5 ✅ VERIFIED (approval, preflight, drift) |
| **Determinism** | 7/7 ✅ PASS (drift guard sealed baseline) |

---

## File Locations (Quick Reference)

```
📂 Proof Pack (Primary)
   └─ deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/
      ├─ 01_EXPANSION_GO_NO_GO.md              ← Expansion authorization
      ├─ COMMANDS_RUN.txt                     ← Gate test results
      ├─ WEEK2_DISTRIBUTION_RECORD.md         ← Cohort + channels
      ├─ WEEK2_DAILY_CHECK_TEMPLATE.md        ← Monitoring format
      ├─ WEEK2_DAILY_CHECKS.md                ← Log (append daily 06:00 UTC)
      ├─ INCIDENT_LOG_WEEK2.md                ← Track P0/P1/P2
      ├─ DRIFT_GUARD_WEEK2.txt                ← Determinism verification
      ├─ ENV.txt                              ← Environment snapshot
      ├─ SHA256SUMS.txt                       ← Integrity verification
      └─ P8_4_PHASE1_CLOSURE.md               ← Phase 1 report

📂 Governance Registry
   └─ docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md ← (append-only log)
```

---

## Daily OPS Checklist (06:00 UTC, Days 1–7)

### Before You Start

- [ ] Approval token is set: `$GO_FOR_PROD_DEPLOY__TITANE_INFINITY`
- [ ] 10 testers have v27.0.0 distribution (check channels A + B)
- [ ] No P0 incidents from prior day (check INCIDENT_LOG_WEEK2.md)
- [ ] Drift guard baseline still clean (run once to verify)

### Daily Tasks (06:00 UTC)

1. **Run drift guard** 
   ```bash
   node scripts/guards/guard-prod-drift.mjs
   ```
   Expected: ✅ NO DRIFT DETECTED
   If ❌ anomaly: PAUSE + INVESTIGATE immediately

2. **Log daily snapshot** (fill WEEK2_DAILY_CHECKS.md using template)
   - Tester status (all online? any dropouts?)
   - Incidents today (P0/P1/P2 count from 00:00 to 06:00 UTC)
   - Infrastructure check (ports clean? no dev processes?)
   - Decision (CONTINUE / PAUSE / ESCALATE?)
   - Notes (anything unexpected?)

3. **Check incidents** (review INCIDENT_LOG_WEEK2.md)
   - P0 detected? → ROLLBACK IMMEDIATE
   - 5+ P1 in 24h? → PAUSE + REVIEW
   - Any credential leaks? → PAUSE + AUDIT

4. **Determine daily decision**
   - If all green: CONTINUE (append CONTINUE decision to log)
   - If 5+ P1: PAUSE (append PAUSE decision, notify Release Authority)
   - If P0: ROLLBACK (append ROLLBACK decision, trigger emergency protocol)

---

## Weekly Milestones

| Date | Day | Milestone | Action |
|------|-----|-----------|--------|
| **2026-02-25** | 1 | Week 2 launch | Distribute v27.0.0 to T5–T10, begin daily monitoring |
| **2026-02-26** | 2 | Day 1 → 2 | Continue monitoring, log daily snapshots |
| **2026-02-27** | 3 | Midweek | Prepare midweek checkpoint (Day 3) |
| **2026-02-28** | 3 | Checkpoint | Final review: CONTINUE or PAUSE? |
| **2026-03-01** | 4 | Resume | Continue monitoring if checkpoint says CONTINUE |
| **2026-03-02** | 5 | Day 5-6 | Collect final metrics |
| **2026-03-03** | 7 | FINAL DAY | Compile 14-day aggregate + make GO/HOLD/ROLLBACK decision |

---

## Stop-the-Line Triggers (Automatic Actions)

### 🔴 P0 (CRITICAL) → ROLLBACK IMMEDIATE

**Examples:**
- App crashes on startup for multiple testers
- Data loss or corruption reported
- Security vulnerability discovered
- Unrecoverable error state

**Action:**
1. Execute `git revert [commit]` to rollback v27.0.0
2. Revoke distribution access (channels A + B)
3. Notify testers with rollback instructions
4. Log incident to INCIDENT_LOG_WEEK2.md
5. Append P0 entry to registry (REVERTED status)

**Timeline:** 5–15 minutes

---

### 🟠 P1 (HIGH) → PAUSE IF 5+ IN 24H

**Examples:**
- Feature completely unavailable
- Major UX breakage (10+ testers affected)
- Persistent memory leaks
- Sync failures blocking core workflow

**Action:**
1. After 5th P1 in 24h: Execute PAUSE
2. Notify Release Authority
3. Collect P1 logs for root cause analysis
4. Do NOT distribute to new testers until resolved
5. Log all incidents to INCIDENT_LOG_WEEK2.md

**Timeline:** Same-day escalation

---

### ⚠️ DRIFT ANOMALY → PAUSE + INVESTIGATE

**Drift Guard Output:** `✗ Unexpected git changes: ...`

**Action:**
1. Execute `git status` and `git diff --stat`
2. Determine if expected (e.g., new P8.4 files) or unexpected (artifact mutation)
3. If unexpected: Investigate cause + execute ROLLBACK
4. If expected: Commit changes + re-run drift guard (should pass after commit)
5. Log anomaly to DRIFT_GUARD_WEEK2.txt

**Timeline:** Same-day investigation

---

### 🔐 CREDENTIAL EXPOSURE → PAUSE + AUDIT

**Examples:**
- API key, token, or password visible in logs
- Tester PII (email, phone) exposed in distribution channels
- Git commit with secrets

**Action:**
1. PAUSE distribution immediately
2. Audit all logs for PII/credentials
3. Revoke any exposed tokens/keys
4. Notify affected testers
5. Log incident to INCIDENT_LOG_WEEK2.md

**Timeline:** 5–30 minutes (depending on scope)

---

### 🔗 DEV PORT RUNNING → PAUSE + CHECK

**Examples:**
- Vite dev server accessible on port 4000
- Node watch process still running
- Dev environment still active

**Action:**
1. Execute `lsof -i :4000` (or relevant ports)
2. Kill any dev processes: `pkill -f vite` or similar
3. Verify production binary still running clean
4. Log port violation to WEEK2_DAILY_CHECKS.md
5. Review why dev process leaked into release environment

**Timeline:** Same-day remediation

---

### 📈 SCALING OVERLOAD (>12 TESTERS) → REJECT

**Current Capacity:** 10 / 12

**If request for Week 2 expansion beyond 12:**
- REJECT immediately
- Document request + rejection in WEEK2_DISTRIBUTION_RECORD.md
- Advise Release Authority: "Capacity ≤12. Next expansion requires Week 3 planning."

---

## What to Do During the Week

### Daily (Every 06:00 UTC)

```bash
# 1. Run drift guard
node scripts/guards/guard-prod-drift.mjs

# 2. Check git status
git status

# 3. Check ports
lsof -i :4000 || echo "✅ No dev ports running"

# 4. Append daily snapshot to log
# Edit WEEK2_DAILY_CHECKS.md with today's section
```

### Midweek (2026-02-28, Day 3)

- Review all 3 days of log entries
- Tally incidents (count P0/P1/P2)
- Check traffic patterns (tester load healthy?)
- Make decision: CONTINUE or PAUSE?
- Create MIDWEEK_CHECKPOINT_20260228.md

### Final (2026-03-03, Day 7)

- Aggregate all 7 days of metrics
- Calculate cumulative hours (expected ~240)
- Calculate incident rate (target: 0 P0)
- Compare vs Week 1 baseline (108 hours, 100/100 score)
- Make final decision: GO full-beta / HOLD / ROLLBACK
- Create VERDICT.md
- Update registry with final entry

---

## Templates (Use These)

### Daily Snapshot Template (Use WEEK2_DAILY_CHECK_TEMPLATE.md)

```markdown
## Day X: YYYY-MM-DD 06:00 UTC

### Tester Status
- Count online: 9 / 10
- Dropouts: 1 (T7 network issues)
- All systems responding: ✅ YES

### Incidents Since Yesterday (06:00 UTC)
- P0 incidents: 0
- P1 incidents: 0 (or list if any)
- P2 incidents: 0 (or list if any)
- Total incidents: 0

### Infrastructure Check
- Drift guard: ✅ NO DRIFT DETECTED
- Dev ports: ✅ CLEAN (no vite, no node watch)
- Git state: ✅ STABLE
- Credentials exposed: ✅ NONE

### Decision
- **Today's outcome:** CONTINUE
- **Next checkup:** Tomorrow 06:00 UTC

### Notes
- No anomalies.
- T7 restored connection by 14:00 UTC same day.
- Infrastructure nominal.
```

---

## How to Continue the Log (Append-Only Rule)

**File:** `WEEK2_DAILY_CHECKS.md`

**Format:**
```markdown
## Day 1: 2026-02-25 06:00 UTC
[Your snapshot here]

## Day 2: 2026-02-26 06:00 UTC
[Your snapshot here]

... (Days 3–7 follow same pattern, as placeholders already set up)
```

**Rules:**
- ✅ DO: Append new day sections
- ✅ DO: Use template format (WEEK2_DAILY_CHECK_TEMPLATE.md)
- ✅ DO: Keep facts only (no speculation)
- ❌ DON'T: Delete or edit prior day entries
- ❌ DON'T: Leave blank entries; fill with "No activity" if needed

---

## Git Workflow for Daily Updates

```bash
# After daily checks (around 07:00 UTC)
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Edit WEEK2_DAILY_CHECKS.md to add today's snapshot
nano deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/WEEK2_DAILY_CHECKS.md

# Stage and commit
git add deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/WEEK2_DAILY_CHECKS.md
git commit -m "ops: P8.4 Week 2 daily check Day X (2026-02-2X 06:00 UTC)"

# Push to origin
git push origin main
```

---

## Emergency Contact Flow

| Severity | Trigger | Action | Notify |
|----------|---------|--------|--------|
| **P0** | App crash / data loss / security | ROLLBACK IMMEDIATE | Release Authority + Security |
| **P1** | 5+ high incidents in 24h | PAUSE + escalate | Release Authority + OPS |
| **Drift Anomaly** | Unexpected git changes | PAUSE + investigate | Release Authority + Dev |
| **Credential Leak** | PII/token exposed | PAUSE + audit | Release Authority + Security |

**Fallback (If no contact):** PAUSE and wait for Release Authority to review.

---

## References

- **P8.4 Proof Pack:** `deployment/latest/certification/phase8_4/P8_4_WEEK2_EXPANSION_20260217_232914/`
- **P8.4 Registry Entry:** `docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md` (search "P8_4_WEEK2_EXPANSION")
- **P8.3 Baseline:** `deployment/latest/certification/phase8_3/P8_3_WEEK1_STABILITY_20260217_231706/`
- **Approval Gate:** `scripts/ops/p8_approval_gate.mjs`
- **Drift Guard:** `scripts/guards/guard-prod-drift.mjs`

---

## Success Criteria (Week 2 Pass / Fail)

### ✅ PASS (Advance to Full-Beta)
- **No P0 incidents** detected during 7 days
- **≤ 2 P1 incidents** (manageable, non-critical)
- **0 drift anomalies** (deterministic throughout)
- **100% uptime** or ≥98% uptime (acceptable brief outages)
- **≥240 cumulative tester-hours** (10 testers × 7 days ≈ 240)
- **No credential leaks** or security violations

### ⏸️ HOLD (Extend Week 2 / Fix Issues)
- **1 P0 incident** detected + fixed same-day (root cause clear)
- **3–4 P1 incidents** (recoverable, need minor fixes)
- **1 drift anomaly** detected + remediated (non-critical)
- **Partial uptime** (95–98%, acceptable if reason understood)

### ❌ ROLLBACK (Stop & Investigate)
- **Multiple P0 incidents** (>1) or P0 not quickly resolved
- **5+ P1 incidents** in same day or recurring
- **Multiple drift anomalies** (indicates systematic issue)
- **Credential leak** (security violation)
- **Dev ports left running** in production (integrity concern)

---

## Post-Week 2 Pathway

**If PASS → Full-Beta (Week 3+)**
- Scale to 50–100+ testers
- Move to continuous monitoring (not just daily)
- Establish incident SLAs (P0 < 15 min, P1 < 1 hour)

**If HOLD → Extend Week 2 or Fix & Re-launch**
- Identify root cause
- Deploy fix to v27.0.1 (if needed)
- Repeat Week 2 with new binary or extended monitoring

**If ROLLBACK → Investigation & Remediation**
- Revert to v26.x (stable baseline)
- Conduct root cause analysis
- Plan v27.0.1 or v28.0.0 fix
- Restart P8 certification path (new phase)

---

✨ **Ready for launch. Remember: DETERMINISTIC BASELINE, ZERO MUTATIONS, STOP-THE-LINE DISCIPLINE.**

Good luck, OPS team! 🚀
