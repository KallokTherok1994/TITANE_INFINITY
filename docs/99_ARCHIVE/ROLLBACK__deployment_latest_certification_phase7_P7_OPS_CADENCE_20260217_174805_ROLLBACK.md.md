# ROLLBACK: P7 Emergency Procedures

**Status:** P7 OPS Cadence (No code changes, rollback minimal)

---

## Overview

P7 is a **read-only audit** with OPS documentation — no production code modified, only:
- Proof pack created (`deployment/latest/certification/phase7/P7_OPS_CADENCE_*`)
- OPS cadence + safety procedures documented
- Registry entry appended

**If rollback needed:** Git operations are simple (restore + push).

---

## Scenario 1: Revert P7 Registry Append (if required)

### Decision Tree
- ✅ **If no issues reported:** Keep P7 sealed (no rollback needed)
- ❌ **If drift detected post-distribution:** Use OPS_RUNBOOK incident response (not rollback here)
- ❌ **If P7 verdict was wrong:** Rare; use "Audit Reversal" below

### Rollback Command
```bash
# Revert registry append (last commit)
git log -2 --oneline
# Expected: Latest = P7 append, previous = P6 final

git revert HEAD --no-edit
# Creates reverting commit (don't use --hard reset)

git push origin HEAD
```

**Verification:**
```bash
git log -1 --oneline
# Should show: "Rollback commit" message

git diff HEAD^ docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md
# Should show: P7 removal
```

---

## Scenario 2: Cancel Field Distribution (if blocker discovered)

**If DEB/AppImage field smoke verdict should be FAIL instead of PASS:**

```bash
# 1. Document the issue
cat > /tmp/p7_distribution_cancel.txt << "EOF"
Issue: DEB field smoke inconclusive
Root cause: [diagnostic]
Action: Retract distribution, re-audit
EOF

# 2. Revert P7 registry
git revert HEAD --no-edit

# 3. Append cancellation note (append-only)
cat >> docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md << "EOF"

## P7_OPS_CADENCE_DISTRIBUTION_CANCELED

**Date:** 2026-02-17T19:00:00Z
**Reason:** Field smoke DEB result inconclusive (issue #XXX)
**Action:** Reverted to P6 state, re-audit P7 scheduled
**Revert Commit:** [hash]

EOF

git add docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md
git commit -m "docs: cancel P7 distribution, re-audit scheduled"
git push origin HEAD
```

---

## Scenario 3: Emergency Rollback to P6 (Complete)

If production incident requires full rollback:

```bash
# Find last known-good commit (P6 final)
git log --grep="P6 OPS_READINESS" --oneline -5
# Expected: ab5e0f46 (or similar)

# Hard reset to P6
git reset --hard ab5e0f46

# Force push (⚠️ destructive)
git push -f origin HEAD

# Notification
echo "⚠️ EMERGENCY: Rolled back to ab5e0f46 (P6 final)"
```

---

## Scenario 4: Restore Release Bundle (if corrupted post-distribution)

If field reports indicate distributed package is corrupted:

```bash
# Check git history
git log --oneline -- deployment/latest/release/ | head -5

# Restore from P5 seal commit (0c7c3101)
git restore --source=0c7c3101 -- deployment/latest/release/

# Verify checksums still match
cd deployment/latest/release/p4_deploy_20260217_171400/
sha256sum -c SHA256SUMS.released.txt

# Commit
git add deployment/latest/release/
git commit -m "chore: restore release from P5 seal (incident XYZ)"
git push origin HEAD
```

---

## Scenario 5: Revoke Distribution (Post-Field)

If field distribution must be revoked (e.g., critical bug discovered):

```bash
# 1. Publish revocation notice
# (via release notes / support channel)
echo "Security advisory: Revoke v27.0.0-amd64"

# 2. Document in registry (append-only)
cat >> docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md << "EOF"

## P7_FIELD_DISTRIBUTION_REVOKED

**Date:** 2026-02-17T22:00:00Z
**Version:** 27.0.0-amd64 (AppImage + DEB)
**Reason:** [CVE/critical bug/incident description]
**Mitigation:** Users should rollback to v26.4.0
**Resolution:** New build v27.0.0-fix being prepared
**Escalation:** TTPM + Security Team notified

EOF

git add docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md
git commit -m "docs: revoke P7 field distribution (incident XYZ)"
git push origin HEAD
```

---

## Rollback Verification Checklist

After any rollback:

```bash
# ✅ Verify git state
git status --porcelain=v1
# Expected: Clean or only rollback commit staged

# ✅ Verify HEAD
git rev-parse HEAD
# Expected: P6 final commit (ab5e0f46) or rollback commit

# ✅ Verify no untracked prod changes
git ls-files -o --exclude-standard | grep -v "\.gitignore" | head -5
# Expected: Empty or only expected untracked (build artifacts)

# ✅ Re-run drift guard (should be stable)
node scripts/guards/guard-prod-drift.mjs
# Expected: exit 0 (stable)

# ✅ Verify release dir (if rolled back)
ls -la deployment/latest/release/p4_deploy_20260217_171400/dist | head -2
# Expected: Files present
```

---

## Escalation Contacts

| Scenario | Contact | Action |
|----------|---------|--------|
| Field smoke inconclusive | Tech lead | Assess + decide revert |
| Distribution revocation | TTPM + Security | Notify users + document |
| Production rollback | On-call SRE | Execute rollback + alert |
| Repeated issues | Team meeting | RCA + procedure update |

---

## Time-to-Revert Estimates

| Action | Time | Risk |
|--------|------|------|
| Revert registry append | 2 min | 🟢 LOW (no code) |
| Cancel distribution | 5 min | 🟡 MEDIUM (user notification needed) |
| Full rollback to P6 | 5 min | 🔴 HIGH (force push) |
| Restore release from git | 10 min | 🟡 MEDIUM (verify checksums) |

---

## Prevention: Avoid Rollback

**Best Practices:**
1. ✅ Run drift guard weekly: `node scripts/guards/guard-prod-drift.mjs`
2. ✅ Monitor field incident reports daily first week
3. ✅ Test distribution artifacts locally before release
4. ✅ Keep support bundle export procedure ready
5. ✅ Review OPS_RUNBOOK.md pre-distribution

---

## Post-Rollback (If Executed)

After completing any rollback:

1. **Document:** Append incident to registry (append-only)
2. **Notify:** Alert team via Slack/email/incident channel
3. **Root Cause:** Schedule RCA within 24h
4. **Prevention:** Update procedures if pattern emerges

**Template:**
```markdown
## INCIDENT_[DATE]_P7_ROLLBACK

**Date:** [YYYY-MM-DD]
**Trigger:** [Brief description]
**Rollback To:** [Commit hash + phase name]
**Reason:** [Root cause]
**Duration:** [Time to fix]
**Resolution:** [What was done]
**Prevention:** [What changed to avoid recurrence]
```

---

**Last Updated:** 2026-02-17  
**Valid Until:** Next major incident or phase P8
