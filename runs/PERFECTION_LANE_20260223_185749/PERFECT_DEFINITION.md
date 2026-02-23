# Definition of Perfect v27.0.5+ (SLOs + Measurable Budgets)

## SLO Targets (Next Level)

### Stability SLOs

- **Crashes**: 0/24h (current ✅)
- **Fatal Errors**: 0/24h (current ✅)
- **Error Rate**: < 0.05% (current 0%, budget +0.05%)

### Performance SLOs

- **Provider Latency**: 11ms -2% (current 11ms, budget -0.2ms) → target 10.8ms
- **Conv. Engine Latency**: 14ms -1% (current 14ms, budget -0.14ms) → target 13.86ms
- **UI Load**: 1198ms -2% (current 1198ms, budget -24ms) → target 1174ms

### Reliability SLOs

- **Uptime**: 99.99% (current 99.99%, hold)
- **Provider Availability**: 99.95% (measure from IPC isolation layer)
- **UI Critical Path Success**: 100% (current ✅)

### User Experience SLOs

- **UI Flake Rate**: < 0.5% (measure from UI runner if available)
- **Conversation Response Spread (P95/P5 ratio)**: < 1.3x (measure variance)
- **Cold Start Time**: < 2s (platform dependent, baseline TBD)

## Improvement Budgets (Next Release, v27.1.0 or perfection hotfix)

- Performance regression budget: +1% MAX (any harder regression = BLOCKED)
- Memory growth budget: +2% MAX (no creep > 250MB baseline)
- Crash tolerance: 0 NEW (any new crash signature = BLOCKED)
- Flake tolerance: 0 NEW (any new flaky test = BLOCKED)

## Invariants (Non-Negotiable)

- Tauri-only (no network API expansion)
- 4-Ring separation maintained
- IPC isolation perfect (no new allowlist entries unless mitigated)
- Offline-first capability preserved
- Zero policy breaches

## Success = No SLO Regression + At Least 1 SLO Improvement

- Not a "refactor for style"
- Must have measured proof (A/B or baseline/candidate x3)
- Must pass all gates
