# ROLLBACK: P6 Emergency Procedures

**Status:** P6 OPS Readiness (No code changes, rollback minimal)

---

## Overview

P6 is a **read-only audit** — no production code modified, only:
- Proof pack created (`deployment/latest/certification/phase6/P6_OPS_READINESS_*`)
- Registry entry appended

**If rollback needed:** Git operations are simple (restore + push).

---

## Scenario 1: Revert P6 Registry Append (if required)

### Decision Tree
- ✅ **If no field issues reported:** Keep P6 sealed (no rollback needed)
- ❌ **If drift detected during ops:** Rollback not here—use OPS_RUNBOOK.md
- ❌ **If P6 verdict was wrong:** Rare; see "Audit Reversal" below

### Rollback Command
```bash
# Revert registry append (last commit)
git log -2 --oneline
# Expected: Latest = P6 append, previous = P5 final

git revert HEAD --no-edit
# Creates a reverting commit (don't use --hard reset)

git push origin HEAD
```

**Verification:**
```bash
git log -1 --oneline
# Should show: Rollback commit message

git diff HEAD^ deployment/latest/certification/phase6/ | head -20
# Should show: P6 removal (or be empty if using revert)
```

---

## Scenario 2: Remove P6 Proof Pack (if storage issue)

**⚠️ Only if space critical and audit already documented outside repo.**

```bash
# Backup first
tar czf /tmp/p6_backup_$(date +%s).tar.gz deployment/latest/certification/phase6/

# Remove directory
rm -rf deployment/latest/certification/phase6/P6_OPS_READINESS_*

# Commit removal
git add -A
git commit -m "chore: remove P6 proof pack (archived externally)"
git push origin HEAD
```

**Risk:** Loss of in-repo audit trail. Ensure external backup exists.

---

## Scenario 3: Audit Reversal (Verdict Was Wrong)

If post-audit analysis finds a blocker (e.g., "gate C2 actually failed"):

```bash
# Step 1: Document the issue
cat > /tmp/p6_audit_correction.txt << "EOF"
Issue: Gate C2 reproducibility was not actually x3 identical
Root cause: Build cache corruption detected
Action: P6 reverted, re-audit scheduled
EOF

# Step 2: Revert P6
git revert HEAD --no-edit

# Step 3: Append correction to registry (append-only)
cat >> docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md << "EOF"

## P6_OPS_READINESS_REVERTED

**Date:** 2026-02-17T18:00:00Z
**Reason:** Gate C2 variance detected (issue #XXX)
**Action:** Reverted to P5 state pending re-audit
**Revert Commit:** [git revert hash]

EOF

git add docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md
git commit -m "docs: revert P6, audit issue detected"
git push origin HEAD
```

---

## Scenario 4: Emergency Rollback to P5 (Complete)

If production incident requires full rollback:

```bash
# Find last known-good commit (P5 final)
git log --grep="P5 complete" --oneline -5
# Expected: 0c7c3101 (or similar)

# Hard reset to P5
git reset --hard 0c7c3101

# Force push (⚠️ destructive)
git push -f origin HEAD

# Notification
echo "⚠️ EMERGENCY: Rolled back to 0c7c3101 (P5 final)"
```

---

## Scenario 5: Restore Release Bundle (if corrupted)

If `deployment/latest/release/` is corrupted:

```bash
# Check git history
git log --oneline -- deployment/latest/release/ | head -5

# Restore from commit where release was sealed
git restore --source=0c7c3101 -- deployment/latest/release/

# Verify checksums
cd deployment/latest/release/p4_deploy_20260217_171400/
sha256sum -c SHA256SUMS.released.txt

# Commit
git add deployment/latest/release/
git commit -m "chore: restore release from P5 seal"
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
# Expected: P5 final commit (0c7c3101) or rollback commit

# ✅ Verify no untracked prod changes
git ls-files -o --exclude-standard | grep -v "\.gitignore" | head -5
# Expected: Empty or only expected untracked (build artifacts)

# ✅ Rerun drift guard
node scripts/guards/guard-prod-drift.mjs
# Expected: exit 0 (stable)

# ✅ Verify release dir
ls -la deployment/latest/release/p4_deploy_20260217_171400/dist | head -2
# Expected: Files present
```

---

## Escalation Contacts

| Scenario | Contact | Action |
|----------|---------|--------|
| Drift detected | On-call SRE | Run OPS_RUNBOOK.md incident response |
| Major bug in P6 | Tech lead | Assess + decide reversal |
| Storage full | DevOps | Remove external backups first, then consider P6 removal |
| Audit questioned | A TTPM | Attach proof pack evidence + re-audit if needed |

---

## Time-to-Revert Estimates

| Action | Time | Risk |
|--------|------|------|
| Revert registry append | 2 min | 🟢 LOW (no code) |
| Remove proof pack | 5 min | 🟡 MEDIUM (loss of audit trail) |
| Full rollback to P5 | 5 min | 🔴 HIGH (force push) |
| Restore release from git | 10 min | 🟡 MEDIUM (verify checksums) |

---

## Prevention: Avoid Rollback

**Best Practices:**
1. ✅ Run drift guard weekly: `node scripts/guards/guard-prod-drift.mjs`
2. ✅ Monitor logs regularly: `tail -f ~/.local/share/titane-infinity/*.log`
3. ✅ Keep git clean: `git status` before changes
4. ✅ Document incidents: Append to incident log (append-only)
5. ✅ Review OPS_RUNBOOK.md pre-deployment

---

## Post-Rollback (If Executed)

After completing any rollback:

1. **Document:** Append incident to registry
2. **Notify:** Alert team via Slack/email/issue
3. **Root Cause:** Schedule RCA within 24h
4. **Prevention:** Update procedures if pattern emerges

**Template:**
```markdown
## INCIDENT_[DATE]_ROLLBACK

**Date:** [YYYY-MM-DD]
**Trigger:** [Brief description]
**Rollback To:** [Commit hash]
**Reason:** [Root cause]
**Duration:** [Time to fix]
**Resolution:** [What was done]
**Prevention:** [What changed to avoid recurrence]
```

---

**Last Updated:** 2026-02-17  
**Valid Until:** Next major deployment (P7+)
