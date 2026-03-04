# Deployment Readiness Checklist for v27.0.6

## Pre-Deployment Gates (v27.0.6 Hotfix)

### Code Reviews & Approval
- [x] All 9 governance gates: PASS
- [x] Proof artifacts complete
- [x] Pivot rationale documented
- [x] Version plan approved

### Build & Artifact Verification
- [ ] AppImage build complete
- [ ] DEB build complete
- [ ] SHA256 hashes verified
- [ ] Size regression check (<2%)

### Testing & Validation
- [ ] `pnpm run test` → 100% PASS
- [ ] `pnpm run lint` → 0 issues
- [ ] `pnpm run build` → exit 0
- [ ] E2E smoke test → PASS
- [ ] Deployments/docs consistency check

### Deployment Infrastructure
- [ ] Wave 1 user list (5% sample) prepared
- [ ] Monitoring alerts configured
- [ ] On-call runbook ready
- [ ] Rollback procedure tested

### Registry & Record
- [ ] Version bump in all 3 files (if needed)
- [ ] deployment/latest/ updated
- [ ] SHA256SUMS_v27.0.6.txt created
- [ ] MANIFEST.json updated
- [ ] Registry event recorded

---

## Wave 1 Deployment (5% Early Adopters)

### Deployment Window
- **Time**: Immediate (after artifact verification)
- **Users**: 5% sample (early adopter group)
- **Channels**: GitHub releases + in-app updater

### Monitoring (24h)
- **Metrics**: Provider latency, UI responsiveness, crash rate
- **Baseline**: Frozen from Phases 2-9 (provider 11ms, UI 1198ms)
- **Alert threshold**: Any regression >1%
- **Health check**: Every 5 minutes (escalate to 15min after 1h stability)

### Success Criteria for Wave 1→2 Promotion
✅ **All of**:
1. Zero critical errors in logs
2. Crash rate = 0
3. No latency regression (provider ≤11.1ms, UI ≤1210ms)
4. User feedback: ≥95% positive or neutral
5. 24h elapsed without incident

**If FAIL**: Rollback to v27.0.5-prod (5 min max)

---

## Wave 2 Deployment (25% Mainstream)

### Conditions
- Wave 1 metrics: PASS (all 5 criteria met)
- 24h validation completed
- No rollback incidents

### Deployment
- Users: 25% (general user population)
- Monitoring: 15-minute cadence
- Duration: 24-48h

### Promotion to Wave 3
Same success criteria as Wave 1, but with confidence from larger sample

---

## Wave 3 Deployment (100% GA)

### Conditions
- Wave 2 metrics: PASS
- 48h+ of monitoring
- No anomalies across sample

### Deployment Actions
1. Deploy to 100% user base
2. Announce in release notes
3. Monitor 24x7 (standard ops cadence)
4. Archive Wave 1-2 logs to reports/

---

## Risk Mitigation

### Level 1: Build Failure
**Action**: Verify PROD token, rebuild, re-sign artifacts
**Timeline**: <30 min

### Level 2: Test Failure
**Action**: Run tests locally, debug, revert if needed
**Timeline**: <1 hour

### Level 3: Deployment Issue (Wave 1)
**Action**: Immediate rollback to v27.0.5-prod
**Timeline**: <5 min

### Level 4: Critical User Impact
**Action**: Emergency standdown, incident runbook
**Timeline**: <15 min escalation

---

## Post-Deployment Review (48h Post-Wave 3)

| Item | Owner | Status |
|------|-------|--------|
| Metrics report | DevOps | Pending |
| User feedback summary | Product | Pending |
| Critical issues (if any) | Engineering | Pending |
| Deployment approval sign-off | Lead | Pending |

