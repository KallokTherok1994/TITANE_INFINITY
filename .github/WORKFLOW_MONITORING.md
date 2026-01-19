# 📊 GitHub Actions Workflow Monitoring

**Purpose:** Track CI/CD health and performance trends  
**Updated:** Automatically via GitHub Actions  
**Dashboard:** https://github.com/KallokTherok1994/TITANE_INFINITY/actions

---

## 🎯 Workflow Success Metrics

### Release Workflow (release.yml)

| Metric | Target | Status | Last Run |
|--------|--------|--------|----------|
| **Success Rate** | 95%+ | 🟢 | v26.3.1-alpha → In Progress |
| **Build Time** | < 15 min | 🟢 | Expected: 10-12 min |
| **Test Pass Rate** | 100% | 🟢 | 455+ tests |
| **Artifact Integrity** | 100% | 🟢 | SHA256 validated |

### CI Workflow (ci.yml)

| Metric | Target | Status | Last Run |
|--------|--------|--------|----------|
| **PR Test Pass** | 100% | 🟢 | Latest: ✅ |
| **Lint Pass** | 100% | 🟢 | Latest: ✅ |
| **Type Check Pass** | 100% | 🟢 | Latest: ✅ |
| **Test Coverage** | 80%+ | 🟠 | Need measurement |

---

## ⚠️ Alert Thresholds

### Critical (Release Blocker)
```
❌ Build timeout > 20 minutes
❌ Test failure (any)
❌ Launch time > 3.0s (hard limit)
❌ Binary size > 150 MB (hard limit)
❌ Artifact checksum mismatch
```

### Warning (Performance Alert)
```
🟠 Build time > 15 minutes
🟠 Launch time > 2.5s (approaching threshold)
🟠 Binary size > 120 MB (approaching limit)
🟠 Test time > 10 minutes
```

### Info (Tracking Only)
```
🔵 Performance improved < 5%
🔵 Build time trending up
🔵 New tests added
```

---

## 🔄 Workflow Execution Rules

### Release Workflow Triggers
```
Trigger: git tag -a v* -m "message" && git push origin v*
Automatic Actions:
  1. Tests run (455+)
  2. Build artifacts (AppImage/DEB/RPM)
  3. Generate checksums
  4. Create GitHub Release
  5. Update latest.json (auto-updater)
  6. Performance regression check ← NEW
```

### CI Workflow Triggers
```
Trigger: PR to MAIN or push to MAIN
Automatic Actions:
  1. Lint check
  2. TypeScript type check
  3. Unit tests
  4. Rust backend tests
  5. E2E tests (optional)
  6. Performance baseline check ← NEW (PR only)
  7. Merge allowed if: all checks pass ← NEW
```

---

## 🛡️ Branch Protection Rules

### MAIN Branch (Enforced)
```
✅ Require status checks to pass:
   - build (tests)
   - lint
   - type-check
   - test
   - test-rust

✅ Require code reviews:
   - 1+ approved review required
   - Dismiss stale reviews on push

✅ Require branches up to date:
   - Before merge, rebase/merge

✅ Restrict push access:
   - Only Kevin Thibault can push directly
   - All others must use PR + reviews
```

---

## 📈 Performance Trend Tracking

### v26.3.0 Baseline (2026-01-18)
```json
{
  "version": "v26.3.0",
  "timestamp": "2026-01-18T19:55:32Z",
  "metrics": {
    "launch_time_avg_s": 2.001,
    "launch_time_stddev_s": 0.0004,
    "binary_size_mb": 81.00,
    "memory_idle_mb": 53,
    "cpu_idle_percent": 2.5
  }
}
```

### v26.4.0 Targets
```json
{
  "version": "v26.4.0",
  "timestamp": "TBD",
  "targets": {
    "launch_time_avg_s": 1.5,     // -25%
    "binary_size_mb": 75,         // -7%
    "memory_idle_mb": 50,         // -6%
    "cpu_idle_percent": 2.0       // -20%
  }
}
```

---

## 🔍 Workflow Health Checks

### Weekly Health Review
```bash
# Check success rate
gh run list --status success --limit 50 | wc -l

# Check failed runs
gh run list --status failure --limit 50

# Check average build time
gh run list --limit 50 | jq '.[] | .run_number, .conclusion'

# Generate report
gh run view <run-id> --json jobs,duration,conclusion
```

### Monthly Performance Review
```
1. Compare launch time trends
2. Check for regressions
3. Identify optimization opportunities
4. Update targets if needed
5. Document lessons learned
```

---

## 🚨 Escalation Procedures

### If Workflow Fails

**Step 1: Identify Failure (1 min)**
```
❌ Check GitHub Actions tab
📌 Click on failed workflow run
📋 Review logs for error message
```

**Step 2: Assess Severity (2 min)**
```
CRITICAL: Blocks production release
  → Release blocker, fix immediately
  
HIGH: Blocks merges to MAIN
  → Fix before next PR can merge
  
MEDIUM: Warning, not blocking
  → Schedule fix within 24h
```

**Step 3: Remediate (varies)**
```
For test failures:
  1. pnpm test locally to reproduce
  2. Fix code/test
  3. Commit fix
  4. Retry workflow

For build failures:
  1. Check system dependencies
  2. Review recent commits
  3. Clean build cache if needed
  4. Rerun

For performance regressions:
  1. Profile with cargo flamegraph
  2. Identify hot spot
  3. Optimize code
  4. Rerun benchmark
```

---

## 📞 Support & Contacts

**Workflow Issues:**
- Check logs: https://github.com/KallokTherok1994/TITANE_INFINITY/actions
- Review commits: git log --oneline -10
- Profile locally: pnpm run dev

**Performance Issues:**
- Benchmark: ./scripts/test/benchmark-performance.sh
- Profile: cargo flamegraph
- Optimize: See PERFORMANCE_TESTING.md guide

**Build Issues:**
- Dependencies: sudo apt-get install libwebkit2gtk-4.1-dev
- Cache: pnpm store prune && cargo clean
- Retry: Full clean build on GitHub

---

## ✅ Workflow Validation Checklist

Before marking workflow as "stable":

- [ ] 5+ successful runs without failure
- [ ] Build time consistently < 15 min
- [ ] All tests passing consistently (455+)
- [ ] Performance within thresholds
- [ ] Artifacts verified (checksums match)
- [ ] Release notes generated automatically
- [ ] latest.json updates correctly
- [ ] No security warnings in logs

---

**Last Updated:** 2026-01-18  
**Maintained By:** GitHub Actions  
**Status:** 🟢 **ACTIVE & MONITORING**

