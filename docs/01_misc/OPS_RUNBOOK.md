# OPS Runbook: P6 Operational Procedures

**Status:** Operational Ready (as of 2026-02-17T17:37:52Z)  
**Audience:** DevOps, SRE, Support Teams

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment)
2. [Verification Commands](#verification)
3. [Monitoring & Drift Detection](#monitoring)
4. [Incident Response](#incidents)
5. [Port Conflict Resolution](#ports)
6. [Rollback Procedures](#rollback)

---

## Pre-Deployment Checklist <a name="pre-deployment"></a>

Before releasing to production, confirm:

- [x] **Build Reproducibility:** 3x builds identical (hash: e0c38059...)
- [x] **No Dev Servers:** Port 5173 (Vite) unbound
- [x] **IPC Contract:** Interface stable
- [x] **Archives:** Phase3/4/5 sealed (0 mutations)
- [x] **Drift Guard:** Deployed to `scripts/guards/guard-prod-drift.mjs`
- [x] **Field Smoke:** AppImage startup OK, production logs only

**Deployment Gate:** ✅ PASS — Ready for distribution

---

## Verification Commands <a name="verification"></a>

### Pre-Launch Health Check
```bash
# 1. Verify no dev servers
netstat -ltn | grep -E "5173|3000|8080" && echo "⚠️ CONFLICT" || echo "✓ OK"

# 2. Check git state
git status --porcelain=v1 | wc -l
# Expected: 0 (clean) or small number (dotfiles ok)

# 3. Verify release dir exists
ls -la deployment/latest/release/p4_deploy_20260217_171400/dist | head -5

# 4. Test drift guard
node scripts/guards/guard-prod-drift.mjs
# Expected exit: 0 (stable)
```

### Production Status
```bash
# Check if AppImage running
ps aux | grep -i "Titan-Stable\|titane-infinity" | grep -v grep

# List open ports
netstat -ltn | grep LISTEN
```

---

## Monitoring & Drift Detection <a name="monitoring"></a>

### Weekly Drift Check
```bash
# Run drift detector
node scripts/guards/guard-prod-drift.mjs

# Interpret exit codes:
# 0 = stable (no drift)
# 2 = drift detected → investigate
# 1 = error (check logs)
```

### Interpret "Drift Detected" (Exit 2)
```bash
# Identify what changed
git diff HEAD
git status --porcelain=v1

# If unintended, revert
git restore <affected-files>
# or follow rollback procedure (see ROLLBACK.md)
```

### Monitor Logs (if long-running)
```bash
# Tauri app logs
export TITANE_LOG="$HOME/.local/share/titane-infinity"
tail -f "$TITANE_LOG/console.log"

# System journal (if systemd service)
journalctl -u titane-infinity -f 2>/dev/null || echo "[Not a systemd service]"
```

---

## Incident Response <a name="incidents"></a>

### Scenario 1: Drift Guard Reports Drift (Exit 2)

**Action:**
```bash
# Level 1: Diagnose
git diff HEAD deployment/latest/release/
git log -1 --name-status

# Level 2: If suspicious
git status --porcelain=v1

# Level 3: Rollback if needed
git restore deployment/latest/release/
```

### Scenario 2: App Won't Start

**Action:**
```bash
# Check logs
echo "Logs location: $HOME/.local/share/titane-infinity/"
ls -la ~/.local/share/titane-infinity/

# Check port conflicts
netstat -ltn | grep LISTEN

# Try manual start (if AppImage)
./deployment/latest/Titan-Stable_27.0.0_amd64.AppImage 2>&1 | head -50
```

### Scenario 3: Port Conflict (5173/3000)

**Action:**
```bash
# Find process occupying port
lsof -i :5173 || echo "Port 5173 free"
lsof -i :3000 || echo "Port 3000 free"

# Kill stray process (if safe)
kill -9 $(lsof -i :5173 -t) 2>/dev/null || echo "Port 5173 already free"

# Restart app
# (provide restart command for your deployment method)
```

### Scenario 4: Secrets/Auth Issues

**Action:**
```bash
# Check auth key
export KEYSTORE_PATH="$HOME/.local/share/titane-infinity/keystore"
ls -la "$KEYSTORE_PATH"

# Verify Owner role
# (consult AUTH OS documentation)
```

---

## Port Conflict Resolution <a name="ports"></a>

### Ports Used by TITANE-Infinity
| Port | Service | Notes |
|------|---------|-------|
| tauri://localhost | IPC | Internal, no network bind |
| (none by default) | HTTP | Local-first, Tauri embedded |

### Known Conflict Ports (Avoid)
| Port | Service | Fix |
|------|---------|-----|
| 5173 | Vite Dev | Kill: `kill -9 $(lsof -i :5173 -t)` |
| 3000 | Node Dev | Kill: `kill -9 $(lsof -i :3000 -t)` |
| 8080 | Generic Web | Kill or change firewall rule |

---

## Rollback Procedures <a name="rollback"></a>

### Full Rollback to Previous Commit

**If P6 changes need reverting:**
```bash
# Identify last known-good commit
git log --oneline -5

# Revert to known-good state
git reset --hard 0c7c3101  # P5 final commit

# Verify
git status
git rev-parse HEAD
```

**If only release needs rollback:**
```bash
# Restore release from git history
git restore deployment/latest/release/

# Verify checksums
cd deployment/latest/release/p4_deploy_20260217_171400/
sha256sum -c SHA256SUMS.released.txt
```

---

## On-Call Escalation

**Severity Levels:**

| Level | Scenario | On-Call Action |
|-------|----------|---|
| 🟢 Green | Drift guard stable, no incidents | Continue monitoring |
| 🟡 Yellow | Single drift detection, recoverable | Diagnose + document |
| 🔴 Red | Multiple drifts or startup failure | Execute rollback + alert |

---

## Contact & Docs

- **Incident Log:** `reports/ai_local_vΩ3/` (append-only)
- **Drift Guard:** `scripts/guards/guard-prod-drift.mjs`
- **Support Bundle:** `docs/ops/SUPPORT_BUNDLE_PLAYBOOK.md`
- **Architecture:** `ARCHITECTURE.md` (4-rings reference)

---

**Last Updated:** 2026-02-17  
**Next Review:** 2026-02-24
