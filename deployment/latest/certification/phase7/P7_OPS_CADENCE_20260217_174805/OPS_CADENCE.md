# P7 OPS CADENCE: Operational Procedures & Drift Monitoring

**Version:** 1.0  
**Date:** 2026-02-17T17:48:00Z  
**Status:** Operational (Drift Guard Active)

---

## Overview

P7 establishes sustainable ops cadence with reproducible procedures and automated drift detection. This document defines:
- Weekly monitoring routine (≤3 commands)
- Monthly field validation
- Alert thresholds (Green/Yellow/Red)
- Rollback procedures

---

## Weekly Monitoring Routine (≤3 min)

### Command 1: Drift Guard Check
```bash
node scripts/guards/guard-prod-drift.mjs
```
**Exit codes:**
- `0`: ✅ STABLE (continue)
- `2`: ⚠️ DRIFT DETECTED (see "Drift Response" section)
- `1`: ❌ ERROR (check logs)

### Command 2: Quick Port Scan (No Dev Servers)
```bash
netstat -ltn 2>/dev/null | grep -E "5173|3000|8080" && echo "⚠️ CONFLICT" || echo "✅ OK"
```

### Command 3: Git State Verify
```bash
git status --porcelain=v1 | grep -v "^??" | wc -l
# Expected: 0 (clean)
```

---

## Monthly Field Validation

### Run Full Field Smoke (DEB + AppImage)
```bash
# See FIELD_SMOKE_DEB_REPORT.md and FIELD_SMOKE_APPIMAGE_REPORT.md for details
# Expected: Both PASS
```

### Baseline Hash Verification
```bash
find deployment/latest/release/p4_deploy_20260217_171400/dist -type f -exec sha256sum {} \; | sha256sum
# Compare against P5 baseline
```

---

## Alert Levels (Status Dashboard)

| Level | Trigger | Action | Contact |
|-------|---------|--------|---------|
| 🟢 GREEN | All checks PASS, drift=0 | No action | Continue monitoring |
| 🟡 YELLOW | Single drift detected, recoverable | 1. Run `git diff HEAD` 2. Document 3. Re-run guard | On-call SRE |
| 🔴 RED | Repeated drifts OR Vite port detected | Execute rollback (see ROLLBACK.md) | Team lead + SRE |

---

## Drift Response (exit 2)

**If drift guard reports exit code 2:**

1. **Diagnose:**
   ```bash
   git diff HEAD
   git status --porcelain=v1
   ```

2. **Categorize:**
   - ✅ Expected (e.g., new untracked dirs during audits): Document + continue
   - ❌ Unexpected (e.g., modified production files): ALERT

3. **Recover (if unexpected):**
   ```bash
   git restore deployment/latest/release/
   node scripts/guards/guard-prod-drift.mjs
   # Expect: exit 0
   ```

---

## Logs & Support

### Log Locations
- **App logs:** `$HOME/.local/share/titane-infinity/`
- **System journal:** `journalctl -u titane-infinity -f` (if systemd)

### Export Support Bundle (Incident)
```bash
./export_support_bundle.sh  # See SUPPORT_BUNDLE_PLAYBOOK.md
```

---

## SLA Targets

- **Monitoring:** Weekly (every Monday 09:00 UTC)
- **Response Time (YELLOW):** &lt;2 hours
- **Recovery Time (RED):** &lt;30 minutes
- **False-Positive Rate:** &lt;5% (new untracked dirs expected during audits)

---

## Escalation Chain

1. **YELLOW Alert:** On-call SRE (1 hour response target)
2. **RED Alert:** SRE + Tech Lead + TTPM (15 min response target)
3. **Repeated Failures:** RCA + procedure update

---

## Last Review
**Date:** 2026-02-17  
**Next Review:** 2026-02-24 (weekly)
