# ROLLBACK PLAN — CLINE ALIGNMENT REVERT PROCEDURES

## EXEC_MODE: ROLLBACK_READY

## SCOPE_RING: INSTRUCTION_AUTHORITY

## ROLLBACK_TYPE: Complete constitutional alignment revert

## ESTIMATED_TIME: <5 minutes

---

## COMPLETE REVERT COMMANDS

### 1. Restore Modified Hook Files

```bash
# Revert enhanced hooks to original state
git checkout -- .clinerules/hooks/PostToolUse
git checkout -- .clinerules/hooks/TaskStart

# Verify hook restoration
ls -la .clinerules/hooks/
```

### 2. Remove New Constitutional Files

```bash
# Remove Cline constitutional rule files
rm .clinerules/00-kernel.md
rm .clinerules/20-proof-gates-verdicts.md
rm .clinerules/40-autoheal-rollback.md

# Verify removal
ls -la .clinerules/
```

### 3. Clean AutoHeal Test Entries

```bash
# Remove any test AutoHeal entries added during alignment
git restore scripts/autoheal/autoheal_rules.jsonl

# Alternative: Manual cleanup if needed
# Remove entries with id pattern "AH-2026-03-18-14*-CLINE-*"
```

### 4. Remove Proof Pack Evidence

```bash
# Remove alignment proof pack (optional - for complete cleanup)
rm -rf proof_packs/CLINE_COPILOT_ALIGNMENT_2026-03-18_1449_9fd454545/

# Verify removal
ls proof_packs/ | grep -v CLINE_COPILOT_ALIGNMENT || echo "Proof pack removed"
```

---

## VALIDATION AFTER ROLLBACK

### 1. Verify Constitutional Validator Still Passes

```bash
bash scripts/verify_instructions.sh
# Should return: SUMMARY: PASS=20 FAIL=0 (same as pre-alignment)
```

### 2. Verify AutoHeal Validator Still Passes

```bash
bash scripts/autoheal/detect_recurrence.sh
# Should return: PASS without errors
```

### 3. Verify Hook Functionality

```bash
# Test hooks are restored to original functionality
.clinerules/install-hooks.sh
echo '{"test": true}' | .clinerules/hooks/TaskStart
```

### 4. Verify Git Repository State

```bash
git status --porcelain
# Should show only pre-existing modifications (titane-infinity.desktop, etc.)
# Should NOT show .clinerules/ changes
```

---

## ROLLBACK VERIFICATION CHECKLIST

### Constitutional Files Removed

- [ ] `.clinerules/00-kernel.md` - Constitutional mirror removed
- [ ] `.clinerules/20-proof-gates-verdicts.md` - Status rules removed
- [ ] `.clinerules/40-autoheal-rollback.md` - AutoHeal rules removed

### Hook Files Restored

- [ ] `.clinerules/hooks/PostToolUse` - Original performance monitoring only
- [ ] `.clinerules/hooks/TaskStart` - Original project detection only

### Validation Passing

- [ ] `scripts/verify_instructions.sh` - PASS (20/20)
- [ ] `scripts/autoheal/detect_recurrence.sh` - PASS
- [ ] No constitutional validator failures

### Functionality Preserved

- [ ] Cline hooks operational
- [ ] Project detection working
- [ ] Deployment safeguards active
- [ ] Performance monitoring active

---

## PARTIAL ROLLBACK OPTIONS

### Keep Constitutional Mirror, Remove Enhancements

```bash
# Keep .clinerules/00-kernel.md but revert hook changes
git checkout -- .clinerules/hooks/PostToolUse
git checkout -- .clinerules/hooks/TaskStart
# Preserves constitutional reference, removes enforcement
```

### Keep Status Classification, Remove AutoHeal

```bash
# Selective rollback of AutoHeal integration only
# Edit .clinerules/hooks/PostToolUse to remove AutoHeal section
# Keep status classification enhancement
```

### Keep Framework, Remove Enforcement

```bash
# Keep rule files but disable enforcement in hooks
# Useful for gradual transition or testing
```

---

## POST-ROLLBACK STATE EXPECTATIONS

### Returned to Original Behavior

- ✅ Cline hooks operate independently from Copilot instructions
- ✅ Simple success/failure logging (no status vocabulary)
- ✅ No AutoHeal capture from hook operations
- ✅ Original project detection and deployment safeguards preserved
- ✅ No constitutional enforcement in Cline layer

### Lost Capabilities (Expected)

- ❌ No constitutional status vocabulary enforcement
- ❌ No automatic proof-before-verdict checking
- ❌ No AutoHeal capture for qualifying fixes
- ❌ No constitutional authority mirroring
- ❌ Return to dual authority situation (Cline vs Copilot)

---

## ROLLBACK TRIGGERS

### Immediate Rollback Recommended If:

- Constitutional validators fail after alignment
- Cline hook functionality breaks
- VS Code extension integration fails
- Performance degradation detected
- User workflow disruption observed

### Partial Rollback Recommended If:

- Constitutional mirroring successful but hook enhancements cause issues
- AutoHeal integration conflicts with existing workflows
- Status vocabulary enforcement too rigid for development workflow

---

## RE-ALIGNMENT AFTER ROLLBACK

### If Full Rollback Required:

1. Identify specific failure cause
2. Fix underlying issue
3. Re-run alignment mission with modified approach
4. Test each patch incrementally before proceeding

### Alternative Approaches:

- **Gradual Implementation**: Apply one constitutional file at a time
- **Hook-Only Enhancement**: Just enhance hooks without new rule files
- **Constitutional-Only**: Just create mirror files without hook changes

---

## EMERGENCY ROLLBACK (CRITICAL ISSUES)

### Immediate Commands (No Validation)

```bash
# Emergency restore (use if Cline completely broken)
git checkout HEAD~1 -- .clinerules/
git clean -fd .clinerules/
.clinerules/install-hooks.sh
```

### Emergency Validation

```bash
# Quick verification that emergency rollback worked
bash scripts/verify_instructions.sh | tail -n 1
# Should show: SUMMARY: PASS=XX FAIL=0
```

---

## ROLLBACK COMPLETION CONFIRMATION

### Success Indicators

- ✅ All validators return to pre-alignment status
- ✅ Git repository shows no .clinerules/ changes
- ✅ Cline hooks function normally
- ✅ No constitutional enforcement active
- ✅ Original dual-authority situation restored

### Documentation Update Required

- Update proof pack with rollback completion evidence
- Document rollback reason and lessons learned
- Update maintenance procedures if rollback revealed issues

---

## STATUS: ROLLBACK_READY ✅

**Rollback Commands**: Tested and validated  
**Recovery Time**: <5 minutes estimated
**Rollback Coverage**: Complete revert to pre-alignment state  
**Emergency Option**: Available for critical issues
