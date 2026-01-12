# TITANE∞ Auto-Heal & Auto-Fix Systems Documentation

**Version:** 26.2.0  
**Date:** 2025-12-22  
**Status:** Document historique (v26.2.0) — Production EN ATTENTE (autorisation)

> NOTE (gouvernance): ce document ne constitue pas une autorisation de déploiement.
> Runtime actuel: v26.3.0.

---

## Overview

TITANE∞ includes comprehensive automated systems for detecting and resolving issues proactively. This document describes all auto-heal and auto-fix capabilities designed to ensure system stability and production readiness.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Auto-Heal & Auto-Fix Pipeline             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Proactive Monitoring (Continuous)                       │
│     └── Configuration drift detection                       │
│     └── Performance degradation detection                   │
│     └── Dependency vulnerability monitoring                 │
│     └── Disk space monitoring                               │
│     └── Process health monitoring                           │
│                                                             │
│  2. Health Checks (On-Demand / Scheduled)                   │
│     └── Dependency health                                   │
│     └── Build configuration validation                      │
│     └── Test infrastructure health                          │
│     └── Security posture checks                             │
│                                                             │
│  3. Auto-Fix (Triggered by Issues)                          │
│     └── Code quality fixes (ESLint, Prettier)               │
│     └── Dependency repairs                                  │
│     └── Configuration corrections                           │
│     └── Cache clearing                                      │
│                                                             │
│  4. Pre-Deployment Validation (Manual/CI)                   │
│     └── 6 Quality Gates                                     │
│     └── Blocker detection                                   │
│     └── Deployment recommendation                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Scripts Reference

### 1. Enhanced Health Check (`health-check-enhanced.sh`)

**Location:** `scripts/maintenance/health-check-enhanced.sh`

**Purpose:** Comprehensive health assessment with auto-repair capabilities

#### Usage

```bash
# Full health check with auto-fix
./scripts/maintenance/health-check-enhanced.sh

# Dry run mode (no changes)
./scripts/maintenance/health-check-enhanced.sh --dry-run

# Verbose output
./scripts/maintenance/health-check-enhanced.sh --verbose

# No auto-fix (report only)
./scripts/maintenance/health-check-enhanced.sh --no-auto-fix
```

#### Checks Performed

1. **Dependency Health**
   - node_modules integrity
   - Broken symlinks detection
   - Lockfile validation
   - Rust toolchain presence

2. **Build Configuration**
   - Version consistency (package.json, Cargo.toml, tauri.conf.json)
   - Tauri-only mode enforcement
   - dist directory presence
   - TypeScript strict mode

3. **Test Infrastructure**
   - Test configuration files
   - Test file count
   - E2E test setup
   - Coverage directory

4. **Security Posture**
   - .env file tracking status
   - Hardcoded secret patterns
   - CSP configuration
   - pnpm audit results

#### Exit Codes

- `0`: Health score >= 95% (EXCELLENT)
- `1`: Health score 70-94% (FAIR)
- `2`: Health score < 70% (POOR)

#### Auto-Fix Capabilities

- Removes broken symlinks
- Installs missing dependencies
- Regenerates lockfiles
- Clears corrupted caches

---

### 2. Proactive Monitor (`proactive-monitor.sh`)

**Location:** `scripts/maintenance/proactive-monitor.sh`

**Purpose:** Continuous monitoring for drift and degradation

#### Usage

```bash
# Run single monitoring cycle
./scripts/maintenance/proactive-monitor.sh

# Run with custom check interval (seconds)
CHECK_INTERVAL=600 ./scripts/maintenance/proactive-monitor.sh
```

#### Monitoring Capabilities

1. **Configuration Drift Detection**
   - Tracks MD5 hashes of critical config files
   - Alerts on unauthorized changes
   - Generates diff reports

2. **Performance Degradation**
   - Build time tracking
   - Test execution time monitoring
   - Threshold-based alerts

3. **Dependency Vulnerabilities**
   - pnpm audit integration
   - cargo audit integration
   - Severity-based alerting

4. **Disk Space**
   - Usage percentage tracking
   - Large directory reporting
   - Critical space alerts

5. **Process Monitoring**
   - Zombie process detection
   - High CPU/memory usage alerts
   - TITANE-specific process tracking

6. **Git Repository Health**
   - Uncommitted changes detection
   - Repository size tracking
   - Large file detection

#### Alert Severities

- **CRITICAL**: Immediate action required (security vulnerabilities)
- **HIGH**: Important issues (disk space critical)
- **MEDIUM**: Should be addressed (config drift, performance)
- **LOW**: Informational

#### Output Files

- **Log:** `~/.titane/proactive-monitor/monitor-YYYYMMDD.log`
- **Alerts:** `~/.titane/proactive-monitor/alerts.log`
- **Reports:** `~/.titane/proactive-monitor/health-report-*.json`

---

### 3. Enhanced Auto-Fix (`06-auto-fix.sh`)

**Location:** `scripts/audit/06-auto-fix.sh`

**Purpose:** Automated issue resolution

#### Usage

```bash
# Run all fixes
./scripts/audit/06-auto-fix.sh --all

# Run specific fixes
./scripts/audit/06-auto-fix.sh --lint      # ESLint only
./scripts/audit/06-auto-fix.sh --format    # Prettier only
./scripts/audit/06-auto-fix.sh --perms     # Script permissions
./scripts/audit/06-auto-fix.sh --clean     # Clean artifacts
./scripts/audit/06-auto-fix.sh --verify    # Verify configs

# Show help
./scripts/audit/06-auto-fix.sh --help
```

#### Fix Capabilities

| Fix # | Category | Action | Risk Level |
|-------|----------|--------|------------|
| 1 | Code Quality | ESLint auto-fix | Low |
| 2 | Code Quality | Prettier formatting | Low |
| 3 | Code Quality | TypeScript check | None (check only) |
| 4 | Permissions | Make scripts executable | Low |
| 5 | Cleanup | Remove temp files | Low |
| 6 | Validation | Verify package.json | None |
| 7 | Validation | Verify Cargo.toml | None |
| 8 | Structure | Create missing dirs | Low |
| 9 | Git | Update .gitignore | Low |
| 10 | Desktop | Validate .desktop file | None |
| 11 | **NEW** Dependencies | Remove broken symlinks | Medium |
| 12 | **NEW** Dependencies | Regenerate lockfile | Medium |
| 13 | **NEW** Cache | Clear corrupted caches | Medium |
| 14 | **NEW** Tests | Repair test fixtures | Low |
| 15 | **NEW** Dependencies | Install missing deps | High |

#### Success Metrics

- **Fixes Applied**: Successfully resolved issues
- **Fixes Skipped**: Issues that require manual intervention
- **Fixes Failed**: Attempted but failed (requires investigation)
- **Success Rate**: (Fixes Applied / Total) * 100

---

### 4. Pre-Deployment Check (`pre-deployment-check.sh`)

**Location:** `scripts/verify/pre-deployment-check.sh`

**Purpose:** Comprehensive validation before production deployment

#### Usage

```bash
# Full pre-deployment check
./scripts/verify/pre-deployment-check.sh

# Quick mode (skip tests and builds)
./scripts/verify/pre-deployment-check.sh --quick

# Verbose output
./scripts/verify/pre-deployment-check.sh --verbose
```

#### Quality Gates

| Gate # | Category | Checks | Blocker if Failed? |
|--------|----------|--------|-------------------|
| 1 | Code Quality | ESLint, TypeScript, Prettier | Yes (ESLint, TS) |
| 2 | Tests | Frontend, Architecture, E2E | Yes (if < 97%) |
| 3 | Security | pnpm audit, secrets, CSP | Yes (critical vulns) |
| 4 | Architecture | 4-Ring, Tauri-only, Local-first | Partial |
| 5 | Build | Version, deps, build test | Yes (version, build) |
| 6 | Documentation | README, CHANGELOG, API docs | No |

#### Deployment Recommendations

- **✅ APPROVED**: All blockers resolved, pass rate >= 90%
- **⚠️ CONDITIONAL**: No blockers, pass rate >= 80%
- **❌ REJECTED**: Blockers present or pass rate < 80%

#### Exit Codes

- `0`: Deployment approved
- `1`: Conditional approval (review needed)
- `2`: Deployment rejected (blockers present)

#### Report Output

```
reports/pre-deployment-YYYYMMDD-HHMMSS/
├── SUMMARY.txt                    # Deployment recommendation
├── pre-deployment-check.log       # Full log
├── ESLint.log                     # ESLint output
├── TypeScript.log                 # TypeScript output
├── Frontend-Tests.log             # Test results
├── npm-audit.json                 # Security scan
└── Build-Test.log                 # Build output
```

---

## Integration with CI/CD

### GitHub Actions Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Run Pre-Deployment Check
  run: ./scripts/verify/pre-deployment-check.sh --quick

- name: Upload Deployment Report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: deployment-report
    path: reports/pre-deployment-*
```

### Pre-Commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run health check before commit
./scripts/maintenance/health-check-enhanced.sh --no-auto-fix --quick

if [ $? -ne 0 ]; then
  echo "❌ Health check failed. Run: pnpm run auto-fix"
  exit 1
fi
```

---

## Scheduled Monitoring

### Systemd Timer (Linux)

Create `/etc/systemd/system/titane-monitor.service`:

```ini
[Unit]
Description=TITANE∞ Proactive Monitor
After=network.target

[Service]
Type=oneshot
User=your-username
WorkingDirectory=/path/to/TITANE_INFINITY
ExecStart=/path/to/TITANE_INFINITY/scripts/maintenance/proactive-monitor.sh
StandardOutput=journal
StandardError=journal
```

Create `/etc/systemd/system/titane-monitor.timer`:

```ini
[Unit]
Description=Run TITANE∞ Proactive Monitor every 5 minutes
Requires=titane-monitor.service

[Timer]
OnCalendar=*:0/5
Unit=titane-monitor.service

[Install]
WantedBy=timers.target
```

Enable:

```bash
sudo systemctl enable titane-monitor.timer
sudo systemctl start titane-monitor.timer
```

### Cron Job (Alternative)

Add to crontab (`crontab -e`):

```bash
# Run proactive monitor every 5 minutes
*/5 * * * * cd /path/to/TITANE_INFINITY && ./scripts/maintenance/proactive-monitor.sh

# Run health check daily at 2 AM
0 2 * * * cd /path/to/TITANE_INFINITY && ./scripts/maintenance/health-check-enhanced.sh
```

---

## Alert Configuration

### Email Notifications

Create `~/.titane/alert-config.sh`:

```bash
#!/bin/bash

ALERT_EMAIL="your-email@example.com"
SMTP_SERVER="smtp.example.com"

send_alert() {
    local severity=$1
    local message=$2
    
    echo "Subject: [TITANE∞] ${severity} Alert
    
${message}" | mail -s "[TITANE∞] ${severity} Alert" "$ALERT_EMAIL"
}
```

### Slack Integration

```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

send_slack_alert() {
    local message=$1
    curl -X POST "$SLACK_WEBHOOK" \
         -H 'Content-Type: application/json' \
         -d "{\"text\": \"🚨 TITANE∞ Alert: $message\"}"
}
```

---

## Best Practices

### 1. Regular Health Checks

- Run daily in development
- Run before every deployment
- Automate via CI/CD

### 2. Proactive Monitoring

- Enable continuous monitoring in production
- Set appropriate alert thresholds
- Review alerts daily

### 3. Auto-Fix Usage

- Use `--dry-run` first to preview changes
- Review logs after auto-fix
- Don't auto-fix in production without testing

### 4. Pre-Deployment Validation

- Always run before merge to main
- Never skip for "small" changes
- Archive reports for compliance

---

## Troubleshooting

### Health Check Fails

1. Check log file for details
2. Run with `--verbose` for more info
3. Run auto-fix: `./scripts/audit/06-auto-fix.sh --all`
4. Re-run health check

### Proactive Monitor Not Alerting

1. Check alert file: `~/.titane/proactive-monitor/alerts.log`
2. Verify thresholds in script configuration
3. Check disk space for log storage

### Auto-Fix Doesn't Resolve Issue

1. Check what was skipped: Look for "WARN" in logs
2. Some issues require manual intervention
3. Consult fix reference table above

### Pre-Deployment Check Blocked

1. Identify blocker gates in SUMMARY.txt
2. Address blockers manually
3. Re-run pre-deployment check
4. Consider `--quick` mode for faster iteration

---

## Maintenance

### Log Rotation

Logs can accumulate over time. Rotate regularly:

```bash
# Clean logs older than 30 days
find ~/.titane -name "*.log" -mtime +30 -delete
find reports/ -name "*.log" -mtime +30 -delete
```

### State Directory Cleanup

```bash
# Clean old state files
find ~/.titane -type f -mtime +7 -delete
```

---

## Future Enhancements

### Planned Features (v27.0+)

1. **Machine Learning Integration**
   - Predict issues before they occur
   - Smart threshold adjustment
   - Anomaly detection

2. **Advanced Metrics**
   - Performance trending
   - Health score history
   - Compliance tracking

3. **Self-Learning Fixes**
   - Learn from manual fixes
   - Suggest new auto-fix rules
   - Community fix sharing

4. **Dashboard Integration**
   - Real-time health visualization
   - Historical trends
   - Alert management UI

---

## Support & Feedback

For issues or suggestions regarding auto-heal systems:

1. Check logs first
2. Review this documentation
3. Open GitHub issue with:
   - Script name
   - Error message
   - Log file excerpt
   - Expected vs actual behavior

---

**Last Updated:** 2025-12-22  
**Maintainer:** TITANE∞ Team  
**License:** See LICENSE.md
