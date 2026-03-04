# P7 Release Distribution Pack

**Date:** 2026-02-17T17:48:00Z  
**Version:** 27.0.0-stable  
**Maintainer:** TITANE Team

---

## Artifacts Summary

### Primary Release

| Artifact | Path | Size | Status |
|----------|------|------|--------|
| AppImage | runtime/stable/Titan-Stable_27.0.0_amd64.AppImage | 82M | ✅ Field Smoke PASS |
| DEB | runtime/stable/Titan-Stable_27.0.0_amd64.deb | 9.9M | ✅ Field Smoke PASS |

### Alternative Versions (Deployment Archive)
- **Latest DEB:** deployment/latest/TITANE-Infinity_27.0.2_amd64.deb
- **Latest AppImage:** deployment/latest/Titan-Stable_27.0.0_amd64.AppImage
- **v27.0.0 Archive:** deployment/v27.0.0-PRODUCTION/

---

## Checksums (SHA256)

### AppImage
```
d5c0e6945dca8142659daec7b2f766a53c56498383dfb19951c0cc8549d56e9f  Titan-Stable_27.0.0_amd64.AppImage
```

### DEB
```
e0c380592300d9b68e4c94b2ac11174654836c7fd3702bc20d544f899e20f656  Titan-Stable_27.0.0_amd64.deb
```

**Verification:** `sha256sum -c <(echo "...")`

---

## Distribution Checklist

### Pre-Distribution
- [ ] ✅ Field smoke DEB PASS (P7-D2)
- [ ] ✅ Field smoke AppImage PASS (P7-D1)
- [ ] ✅ Drift guard stable (exit 0)
- [ ] ✅ No dev server ports detected
- [ ] ✅ Production logs only (no debug)
- [ ] ✅ Archives sealed (P3/P4/P5/P6 immutable)

### Distribution
- [ ] Copy artifacts to release storage
- [ ] Update repository metadata
- [ ] Publish release notes
- [ ] Announce to field testers
- [ ] Monitor post-deployment incidents

### Post-Distribution (Weekly)
- [ ] Run drift guard check
- [ ] Review incident logs
- [ ] Re-baseline if major changes detected

---

## Distribution Instructions

### Option A: Manual Distribution (Local)
```bash
# Copy to central repo
cp runtime/stable/Titan-Stable_27.0.0_amd64.{AppImage,deb} /release/27.0.0-stable/

# Generate manifest
cd /release/27.0.0-stable/
sha256sum * > SHA256SUMS
```

### Option B: Package Repository (if configured)
```bash
# Update APT/package manager
sudo dput ppa:titane/stable Titan-Stable_27.0.0_amd64.deb

# Verify
apt update && apt install -s titan-stable=27.0.0
```

### Option C: Direct Field Distribution
```bash
# Create distribution bundle
tar czf titane-27.0.0-stable.tar.gz \
  runtime/stable/Titan-Stable_27.0.0_amd64.{AppImage,deb} \
  SHA256SUMS

# Share with field team: [link/method]
```

---

## Validation for Recipients

Recipients should verify before installing:

```bash
# 1. Verify checksums
sha256sum -c SHA256SUMS
# Expected: OK for both files

# 2. Verify no dev server (quick)
./Titan-Stable_27.0.0_amd64.AppImage &
sleep 2
netstat -ltn | grep -E "5173|3000" && echo "⚠️ CONFLICT" || echo "✅ OK"
kill %1
```

---

## Release Notes (Template)

```markdown
## TITANE-Infinity v27.0.0-Stable

**Status:** Production Sealed (P5) + OPS Ready (P6) + Distribution Packed (P7)

**What's Included:**
- ✅ Production-sealed build (v27.0.0)
- ✅ No development servers (Vite excluded)
- ✅ Drift guard monitoring (weekly cadence)
- ✅ Ops runbook (incident procedures included)

**Installation:**
- AppImage: Run directly or ~/Applications/
- DEB: `sudo apt install ./Titan-Stable_27.0.0_amd64.deb`

**Verification:**
- Run: `sha256sum -c SHA256SUMS`
- Expected: Both PASS

**Support:**
- Logs: ~/.local/share/titane-infinity/
- Issues: [link to incident procedure]
- Bundle: See SUPPORT_BUNDLE_PLAYBOOK.md
```

---

## Known Considerations

### Local-First Design
- ✅ No automatic updates (manual distribution only)
- ✅ No tracking/telemetry (Ollama localhost reference)
- ✅ No cloud dependency (standalone deployable)

### Monitoring & Rollback
- ✅ Drift guard active (scripts/guards/guard-prod-drift.mjs)
- ✅ Rollback procedure documented (ROLLBACK.md)
- ✅ Incident playbook included (OPS_RUNBOOK.md)

---

## Appendix: File Mapping

**Deployment Locations:**

| Type | Latest | Archive | Status |
|------|--------|---------|--------|
| Release | deployment/latest/release/p4_deploy_20260217_171400/ | deployment/v27.0.0-PRODUCTION/ | ✅ Sealed |
| Certification | deployment/latest/certification/phase7/P7_OPS_CADENCE_*/ | - | ✅ Live |
| Drift Guard | scripts/guards/guard-prod-drift.mjs | - | ✅ Active |
| Ops Docs | docs/ops/OPS_RUNBOOK.md | - | ✅ Complete |

---

**Distribution Pack Created:** 2026-02-17T17:48:00Z  
**Ready for:** Field Testers + Beta Distribution  
**Next Review:** Post-deployment (weekly monitoring)
