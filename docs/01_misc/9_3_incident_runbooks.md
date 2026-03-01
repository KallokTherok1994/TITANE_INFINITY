# Incident Response Runbooks

## Runbook Template

```
INCIDENT: [Name]
SEVERITY: [CRITICAL|HIGH|MEDIUM|LOW]
DETECTION: [Alert rule that triggers]
OWNER: [On-call engineer]

IMMEDIATE (< 2 min):
1. [ ] Acknowledge alert
2. [ ] Check dashboard for confirmation
3. [ ] Is this a false positive? (check 2 metrics)

INVESTIGATION (< 5 min):
4. [ ] Check error logs: tail -50 logs/errors.log
5. [ ] Check provider status: curl provider_status_endpoint
6. [ ] Compare to baseline: dashboard baseline tab
7. [ ] Is it Wave 1 only or affecting other users?

DECISION (< 10 min):
8. [ ] Is this recoverable? (will it self-heal?)
9. [ ] Is this user-impacting? (> 0.1% of users?)
10. [ ] Do we rollback or investigate?

ACTION:
11a. [ROLLBACK] → Follow "Rollback Procedure"
11b. [INVESTIGATE] → Follow "Root Cause Analysis"
11c. [MONITOR] → Log & wait for more data

COMMUNICATION:
12. [ ] Update status page
13. [ ] Notify support team
14. [ ] Post-incident review within 2h
```

---

## Critical Runbook #1: Error Rate Spike

**Detection**: Alert "ErrorRateTooHigh" (> 0.5% for 5 min)

**IMMEDIATE** (< 2 min):

- [ ] SSH into metrics: `ssh prod-mon`
- [ ] Dashboard: Check graph - is it really 0.5%+?
- [ ] Check if Wave 1 only or multi-wave affected

**INVESTIGATION** (< 5 min):

```bash
# Last 50 errors
tail -50 /var/log/titane/error.log

# Error rate by type
grep "ERROR" /var/log/titane/error.log | tail -100 | cut -d: -f2 | sort | uniq -c

# Provider connectivity status
curl -s https://api.provider.ai/health
```

**Decision Tree**:

```
Is error rate rising or stable?
├─ Rising: ROLLBACK (likely cascade failure)
├─ Stable at 0.5%: Investigate root cause
└─ Dropping: MONITOR (transient, watch for recurrence)

What type of errors?
├─ Provider timeout: Alert provider team
├─ IPC failures: Likely deployment artifact - ROLLBACK
├─ User data errors: Investigate database state
└─ Unknown: Check recent code changes (post-tag commits)
```

**ACTION**:

- Rollback: `scripts/rollback-v27-0-5.sh` (< 2 min)
- Investigate: Post to #incidents, start root cause analysis
- Monitor: Set 15-minute alert threshold for same metric

---

## Critical Runbook #2: Provider Latency Spike

**Detection**: Alert "ProviderLatencyHigh" (> 50ms for 2 min)

**IMMEDIATE** (< 2 min):

- [ ] Check provider status page: provider.ai/status
- [ ] Check IPC metrics: `curl localhost:9090/metrics | grep ipc`
- [ ] Is latency spike on provider side or our IPC layer?

**INVESTIGATION** (< 5 min):

```bash
# IPC latency histogram
grep "ipc_latency" /var/log/titane/metrics.log | tail -20

# Provider request count (increased retries?)
grep "provider_retry" /var/log/titane/metrics.log | tail -20

# Network diagnostics
mtr -c 1 provider.ai
```

**Decision Tree**:

```
Is provider status page showing issues?
├─ YES: Their problem, monitor and alert them
├─ NO: Our IPC layer (investigate isolat…
└─ PARTIAL: Check if specific region affected

Is latency getting worse or stable?
├─ Worse: Could cascade, PREPARE rollback
├─ Stable: Monitor, not actionable right now
└─ Improving: Good, watch for recurrence
```

**ACTION**:

- If provider down: Contact provider team, prepare v27.0.4 rollback
- If IPC issue: Post to #incidents, investigate Tauri IPC layer
- If stable: MONITOR, set 30-minute escalation alert

---

## Normal Runbook #3: Memory Growth

**Detection**: Alert "MemoryGrowingTooFast" (> 350MB for 1h)

**Investigation** (< 10 min):

```bash
# Memory over time
grep "memory_usage" /var/log/titane/metrics.log | tail -60

# Is it linear growth (leak) or plateau recovery?
# Is it correlated with user count increase?

# Current top memory consumers
ps aux --sort=-%mem | head -5
```

**Decision Tree**:

```
Is memory usage:
├─ Plateau'ing? → Normal, likely GC recovered
├─ Linear growth? → Possible memory leak
└─ Spike then drop? → GC event, normal

Correlation with user count?
├─ YES: Expected (more users = more memory)
├─ NO: Suspicious, likely leak
```

**ACTION**:

- If plateaued: Log & continue monitoring
- If leak suspected: Page on-call Dev (memory profiling needed)
- If growing > 400MB: Consider graceful restart (off-peak)

**DO NOT**: Rollback for memory - often not critical
