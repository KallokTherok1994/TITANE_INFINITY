# Core Engine Track — Runtime Excellence Roadmap

**Version:** v1.0  
**Phase:** Post-Governance Execution  
**Timeline:** 30-90 days (V21+)  
**Scope:** Runtime performance, stability, user value  

---

## Executive Intent

**One Goal:** Deliver a **stable, performant, responsive** runtime experience — measurable, repeatable, no additional governance overhead.

**What This Is:**
- Product roadmap (not process roadmap)
- Concrete engineering deliverables
- Measurable success criteria
- Explicit scope boundaries

**What This Is NOT:**
- Governance framework
- New organizational structure
- Meta-level process design
- Approval gates or reviews

---

## Primary Objective

### "TITANE Runtime Excellence"

**Definition:** A cognitive runtime that responds to user input in <2s (p95), maintains stability over 8h+ sessions, and gracefully handles network/provider failures.

**Why:**
- User experience is binary: slow = broken, fast = works
- Stability is prerequisite for trust (cognitive OS must not crash mid-session)
- Resilience is baseline (local-first means network can be unreliable)

**Measurement:** Dashboard with three core KPIs (latency p50/p95/p99, session uptime, error rate)

---

## Five Pillars (Measurable Criteria for Success)

### Pillar 1: Pipeline Latency < 2s (p95)

**What:** User types message → sees AI response on screen in <2s (95th percentile)

**Metric:**
- Input received (timestamp A)
- Response rendered (timestamp B)
- **Latency = B - A**
- **Target:** p95 < 2000ms

**Sub-breakdowns (for diagnostics):**
- Input→Prompt construction: < 200ms
- Prompt→AI provider (Ollama): < 1500ms (dominated by Ollama inference)
- Response→UI render: < 300ms

**Current State:** Unknown (no profiling baseline)

**Phase 1 Deliverable (Week 1-2):**
- Profiling instrumentation (browser DevTools + Rust perf)
- Baseline measurement (10K sample messages)
- Dashboard or report showing p50/p95/p99

**Success:** Baseline published, no optimization required yet (just measurement)

---

### Pillar 2: Session Uptime ≥ 8 Hours (Continuous)

**What:** User can chat continuously for 8+ hours without app crash, memory leak, or service degradation

**Metric:**
- Start timestamp
- End timestamp (app still responsive, no crash)
- **Uptime = continuous session without restart**
- **Target:** ≥ 8 hours without user intervention

**Sub-breakdown (for diagnostics):**
- Memory growth over 8h: < 10%
- UI responsiveness: no perceptible lag
- UnifiedMemory (STM→MTM→LTM): graceful handling of 1K+ messages

**Current State:** Unknown (no endurance test suite)

**Phase 1 Deliverable (Week 2-3):**
- Automated endurance test (8h simulated chat, ~1K messages)
- Memory profiling (heap snapshots at 1h, 4h, 8h marks)
- Pass/fail report: uptime ≥ 8h, memory growth tracked

**Success:** Test runs to completion, no crash, memory report published

---

### Pillar 3: Error Recovery (Provider Failover)

**What:** If Ollama goes down (or network is unreliable), app handles gracefully (error message, retry, or fallback)

**Metric:**
- Scenario 1 (Ollama timeout): User gets response in <5s (timeout handled, error shown, optional retry)
- Scenario 2 (Network down): App stays responsive, shows "offline" state, no crash
- Scenario 3 (Provider returns error): Error surfaced to user, UI stable

**Current State:** Unknown (no E2E tests for failure modes)

**Phase 1 Deliverable (Week 3-4):**
- E2E test suite (3 failure scenarios, chromatic coverage)
- Error messages defined + standardized
- Retry/fallback logic documented

**Success:** All 3 scenarios tested, errors localized to provider boundary, UI stable

---

### Pillar 4: Rust Backend Audited & Hardened

**What:** Backend modules (telemetry, security, IPC) are secure, tested, and maintainable

**Metric:**
- Cargo audit: 0 CRITICAL vulns, HIGH resolved or accepted
- Test coverage: ≥ 80% across modules
- MIRI sanitizer: clean (no undefined behavior detected)

**Current State:** Partial (last audit 7+ days ago, coverage unknown)

**Phase 1 Deliverable (Week 3-4):**
- `cargo audit` report (categories: CRITICAL/HIGH/MEDIUM + remediation)
- Test coverage report (by module: telemetry, security, IPC, memory_os)
- MIRI run (check for unsound unsafe blocks)

**Success:** CRITICAL vulns patched, coverage ≥ 80%, MIRI clean

---

### Pillar 5: Documentation (User-Facing Only)

**What:** Users can understand and use TITANE without internal engineering knowledge

**Metric:**
- Onboarding docs exist (Getting Started < 2h to productivity)
- FAQs cover common issues (network problems, memory limits, session restart)
- Troubleshooting guides link to error messages
- No internal governance jargon in user docs

**Current State:** Partial (200% coverage claim, needs validation)

**Phase 1 Deliverable (Week 3-4):**
- Audit user docs for clarity (remove gov jargon)
- Add network troubleshooting section
- Add memory/performance FAQ

**Success:** User docs are clear, jargon-free, actionable

---

## Explicit Out-of-Scope

### What We Don't Do (in Core Engine Track)

❌ **New governance systems**  
❌ **Reorganization or structural changes**  
❌ **Feature expansion** (beyond stabilization)  
❌ **Multi-provider support** (research only, not roadmap)  
❌ **New certificate/audit gates** (use constitutional rule if needed)  

---

## Timeline (30-90 Days)

### Phase 1: Measurement (Days 1-14)

**Goal:** Know what we're optimizing for

**Deliverables:**
- [ ] Performance baseline (Pillar 1)
- [ ] Session endurance test infrastructure (Pillar 2 setup)
- [ ] Failure scenario test suite (Pillar 3 setup)
- [ ] Cargo audit report (Pillar 4)
- [ ] User doc audit (Pillar 5)

**Owner:** Platform team (rotation: performance, memory, runtime, backend)  
**Gate:** All 5 pillars have measurable baselines

---

### Phase 2: Stabilization (Days 15-45)

**Goal:** Hit targets for Pillars 1-4

**Deliverables:**
- [ ] Performance optimizations (target p95 < 2s)
- [ ] Memory leak fixes (if any detected in endurance test)
- [ ] Error handling hardened (Pillar 3 all scenarios pass)
- [ ] Rust vulnerabilities resolved (Pillar 4 CRITICAL/HIGH patched)

**Owner:** Assigned by pillar  
**Gate:** Pillars 1-4 at target OR documented trade-off

---

### Phase 3: Verification & Publication (Days 46-90)

**Goal:** Prove excellence, document for team/users

**Deliverables:**
- [ ] Performance report (latencies, traces, bottlenecks)
- [ ] Uptime report (8h test results, memory snapshots)
- [ ] Error handling report (failure scenarios PASS)
- [ ] Security report (audit clean, test coverage published)
- [ ] User docs final (published in team wiki)

**Owner:** QA + each pillar owner  
**Gate:** All 5 pillars documented + published

---

## Success Checkpoints

| Checkpoint | Date | Criteria (YES/NO) | Owner |
|------------|------|-------------------|-------|
| Phase 1 baselines complete | Day 14 | All 5 pillars measured | Platform |
| Pillar 1 (latency) target | Day 30 | p95 < 2000ms or documented trade-off | PerfTeam |
| Pillar 2 (uptime) target | Day 35 | 8h test PASS, no crash | MemTeam |
| Pillar 3 (failover) target | Day 40 | All 3 scenarios PASS | RuntimeTeam |
| Pillar 4 (audit) target | Day 45 | CRITICAL patched, coverage ≥80% | BackendTeam |
| Phase 3 final report | Day 90 | All 5 pillars verified + published | QA |

---

## Governance (Minimal)

**Review Cadence:** Weekly standup (15min) reporting progress on pillars

**Blocking Issues:** None (this is execution track, not approval track)

**Escalation:** If a pillar cannot meet target by Phase 3 end, document trade-off (not a failure, just known limitation)

**Post-90-Day:** Transition from "roadmap" to "maintenance" (recurring metrics, alerts, regression detection)

---

## Anti-Pattern Guards

### Guard 1: No Process Creep
**If:** New process/gate/committee proposed  
**Then:** Reject (use constitutional rule if governance needed)

### Guard 2: No Scope Expansion
**If:** New feature/subsystem proposed mid-roadmap  
**Then:** Defer to post-Phase 3 (Core Engine Track is stabilization, not innovation)

### Guard 3: No Measurement Abuse
**If:** KPIs gamed or measured inconsistently  
**Then:** Reset baseline, document methodology change

---

## References

- **POST_GOVERNANCE_REFOCUS.md:** Energy audit + priorities translation
- **ANTI-RECURSIVE_SYSTEM_RULE.md:** If new subsystem needed, use this checklist
- **GOVERNANCE_PATTERN_LESSONS.md:** Why Mermaid exists (context for this focus)

---

## Closing Statement

**Core Engine Track** = **No more meta. Only execution.** Measure, optimize, deliver, prove. Ship runtime excellence. Done.

---

**Status:** BINDING (operational roadmap)  
**Owner:** Platform team + assigned pillar owners  
**Review:** Weekly standup; final checkpoint Day 90
