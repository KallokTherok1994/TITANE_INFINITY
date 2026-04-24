# ROLLBACK: P10.3 Certification (Guard Violation)

**Status:** Guard violation prevents E2E execution  
**Rollback Trigger:** Automatic (violation detected before test execution)  
**Cleanup Required:** Sandbox + partial proof pack (preserve violation evidence)

---

## Rollback Procedures

### Level 0: Clean Sandbox (Lightweight)

```bash
# Remove temporary sandbox environment
rm -rf /tmp/titane_p10_3_sandbox_*

# Remove temporary files
rm -f /tmp/p10_3_*.txt

echo "✓ Sandbox cleaned"
```

### Level 1: Revert Proof Pack (Keep Evidence)

```bash
# Keep violation evidence for audit
# But remove incomplete runs
rm -f deployment/latest/certification/phase10_3/P10_3_DESKTOP_E2E_X3_*/04_E2E_RUN_*.txt
rm -f deployment/latest/certification/phase10_3/P10_3_DESKTOP_E2E_X3_*/{08..16}*.txt

# Keep violation documentation
# - 08_GUARD_VIOLATION_LOG.txt (preserved for evidence)
# - VERDICT.md (preserved for audit trail)
# - LOCK.md (preserved)

echo "✓ Incomplete runs removed, evidence preserved"
```

### Level 2: Clean Authorization (if needed)

```bash
# Remove E2E authorization if re-running later
rm -f runtime/ALLOW_E2E_TAURI_BUILD.ok

echo "✓ E2E authorization cleared"
```

### Level 3: Full Reset (if retrying)

```bash
# Complete removal of failed P10.3 proof pack
rm -rf deployment/latest/certification/phase10_3/P10_3_DESKTOP_E2E_X3_20260218T131251Z/

# Reset E2E authorization
rm -f runtime/ALLOW_E2E_TAURI_BUILD.ok

# Git status should still appear clean (E2E dir not tracked if not added)
git status

echo "✓ Full reset complete, ready for P10.3_RETRY"
```

---

## Recovery Path

### To Fix and Retry:

1. **Fix Source Guard Violation**
   ```bash
   # Edit src/services/ai/providers/ollama.ts
   # Replace direct endpoint with unified transport call
   # Verify guard passes:
   pnpm run guard:ollama-proxy
   ```

2. **Create New Authorization**
   ```bash
   mkdir -p runtime
   echo -n "I_AUTHORIZE_E2E_TAURI_BUILD" > runtime/ALLOW_E2E_TAURI_BUILD.ok
   ```

3. **New P10.3 Authorization** (user action required)
   ```
   User must explicitly approve retry:
   "OK_RETRY_P10_3_AFTER_SOURCE_PATCH"
   ```

4. **Re-run P10.3**
   ```
   New proof pack created automatically
   ```

---

## Evidence Preservation

**Keep for audit trail:**
- 08_GUARD_VIOLATION_LOG.txt (violation evidence)
- VERDICT.md (certification result)
- LOCK.md (lock status)
- 01_PRECHECKS.txt (pre-execution state)
- 02_E2E_CONFIG_SNAPSHOT.txt (harness config)
- 03_SANDBOX_SETUP.txt (environment setup)

**Remove (never executed):**
- 04_E2E_RUN_*.txt (not created, guard failed first)
- 08+_*.txt (not created, guard prerequisite)

---

**Rollback Authority:** Automatic (guard violation)  
**Preserve Evidence:** YES  
**Ready for Retry:** YES (after source patch)  
**Timestamp:** 2026-02-18T13:14:00Z UTC
