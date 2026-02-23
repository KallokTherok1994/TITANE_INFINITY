# Support Escalation Matrix

## Tier 1: Automated Handling

**Trigger**: Incoming support ticket

| Issue                      | Automated Action                | Response Time |
| -------------------------- | ------------------------------- | ------------- |
| "App won't start"          | Trigger diagnostic              | Immediate     |
| "Provider connection lost" | Suggest restart                 | Immediate     |
| "Performance slow"         | Check baseline vs actual        | Immediate     |
| "Need to downgrade"        | Instant v27.0.4 rollback option | Immediate     |

---

## Tier 2: Human Support (< 1 hour)

**Trigger**: Automated handling fails or critical issue

| Issue                            | Action                             | Owner      | SLA    |
| -------------------------------- | ---------------------------------- | ---------- | ------ |
| Crash loop reported              | Investigate logs + offer rollback  | Support L2 | 15 min |
| Multiple "won't start" reports   | Alert dev team + consider rollback | Support L2 | 15 min |
| Data loss reported               | Escalate to L3 + pause rollout     | Support L3 | 5 min  |
| Provider API down for > 5% users | Pause Wave, investigate IPC        | Dev Team   | 5 min  |

---

## Tier 3: Engineering Escalation (< 15 minutes)

**Trigger**: Critical issue affecting 5%+ of active users

| Scenario                 | Action                       | Decision                                   |
| ------------------------ | ---------------------------- | ------------------------------------------ |
| Error rate jumps to > 5% | Pause current wave           | Investigate (15 min) or rollback (5 min)   |
| Provider latency > 100ms | Alert engineering            | Investigate IPC layer (10 min)             |
| UI completely broken     | Immediate rollback available | Users can rollback via settings in < 1 min |
| Conversation data lost   | Pause all waves              | Investigate + offer v27.0.4 default        |

---

## Rollback Procedure

### User Self-Service Rollback (< 1 min)

```
Settings → About → Version History
[v27.0.5-prod] → Downgrade to v27.0.4
Confirm → Restart
```

### Automatic Rollback (triggered by monitoring)

```
Error Rate > 5% for 2 consecutive checks
Provider Latency > 100ms sustained 5+ minutes
Crash Rate > 10/minute sustained
↓
Automatic trigger: Disable v27.0.5 in wave deployment
Effect: New users get v27.0.4, existing users get downgrade option
Time to rollback: < 2 minutes global
```

### Manual Rollback (by ops team)

```
1. Disable v27.0.5-prod tag
2. Publish rollback announcement
3. Users auto-offered downgrade
4. Pause all rollout waves
5. Investigate root cause
6. Plan hotfix (v27.0.6) or hold
```

---

## Support Communication Template

**CRITICAL ISSUE RESPONSE (within 5 min)**

```
Subject: URGENT - We're addressing the issue you reported

Hi [User],

Thank you for the alert. We've detected [issue description] affecting a small number of users.

ACTION TAKEN:
✅ Our team is investigating
✅ Safe rollback available (Settings → About → Downgrade)
✅ Will update you within 1 hour

MEANWHILE:
→ If app is unstable, use downgrade link above
→ Your data is safe (auto-backup)
→ We recommend v27.0.4 if experiencing issues

We apologize for any inconvenience. We're on it.
—Support Team
```
