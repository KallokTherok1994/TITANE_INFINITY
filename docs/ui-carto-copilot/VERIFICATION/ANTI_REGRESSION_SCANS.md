# TITANE∞ — Anti-Regression Scan Specifications

**Authority:** GOVERNANCE_RULES.md (GOV-NO-HUMAN-IDENTITY-ATTRIBUTION)  
**Purpose:** Prevent reintroduction of forbidden patterns  
**Frequency:** Weekly + before major changes + pre-release  
**Log Results:** docs/ui-carto-copilot/VERIFICATION/SCAN_RESULTS.md

---

## Overview

These 4 scans detect patterns that violate TITANE∞ constitutional principles:
- **A) NO_EMPTY_OR_SILENT_CATCH** - Zero-silence UI
- **B) NO_DIRECT_INVOKE_BYPASS** - IPC security wrapper
- **C) NO_IPC_FETCH** - Tauri-only (no ipc:// fetch)
- **D) NO_HUMAN_NAME_AUTHORITY** - System authority labels

All scans use reproducible commands (grep/rg/find). Results must be logged with file:line proofs.

---

## Scan A: NO_EMPTY_OR_SILENT_CATCH

### Rule
**Authority:** P1-2_CATCH_AUDIT.md + NC-UI-SILENCE-EXEMPT-001  
**Principle:** Zero-silence UI - all errors must provide feedback (console.error minimum)

### Forbidden Patterns
```typescript
// 1. Empty catch block
catch { }

// 2. Empty catch with parameter
catch (e) { }
catch (error) { }

// 3. Comment-only catch (no console.error/log/toast)
catch (e) {
  // Silent failure
}

// 4. Promise empty catch
.catch(() => {})
.catch(() => void 0)
.catch(() => null)
.catch((_) => {})

// 5. Return-only catch (no log)
catch (e) {
  return false;
}
```

### Allowed Exceptions
**Only these 6 files are exempt (NC-UI-SILENCE-EXEMPT-001):**

| File | Line | Type | Justification |
|------|------|------|---------------|
| panelsStore.ts | 646 | localStorage | Browser API, non-critical |
| useVisionStore.ts | 292 | permission | Device enumeration |
| useVisionStore.ts | 522 | permission | Device enumeration |
| usePerformanceStore.ts | 279 | optimization | Boolean fallback |
| effectsStore.ts | 483 | localStorage | Browser API, non-critical |
| aiPredictiveEngine.ts | 533 | network | Default latency value |

**Any catch block NOT in this list must have:**
- console.error(error) OR
- console.log("error context:", error) OR
- toast notification OR
- visible UI error state

### Scan Command
```bash
# Find all catch blocks
find src -name "*.ts" -o -name "*.tsx" | xargs grep -n "} catch"

# Alternative with ripgrep (faster)
rg -n "} catch" src --type ts

# Check for empty .catch() promises
rg -n "\.catch\(\(\) *=> *\{\}\)" src --type ts
rg -n "\.catch\(\(\) *=> *void 0\)" src --type ts
rg -n "\.catch\(\(\) *=> *null\)" src --type ts
```

### Expected Result
**PASS Criteria:**
- 0 forbidden empty catches found
- OR all found are in NC-UI-SILENCE-EXEMPT-001 (6 files)

### Output Format
| File | Line | Pattern | Allowed? | Reason |
|------|------|---------|----------|--------|
| panelsStore.ts | 646 | `catch { }` | ✅ YES | NC-UI-SILENCE-EXEMPT-001 (localStorage) |
| unknownFile.ts | 123 | `catch { }` | ❌ NO | Not in exception list |

### If Scan FAILS
1. **Identify violations:** Any catch not in exception list
2. **Classification:**
   - P0 if user-facing action (payment, save, delete)
   - P1 if non-critical user action
   - P2 if background/optimization task
3. **Action:**
   - P0/P1: Add console.error minimum (surgical fix)
   - P2: Add to NC-UI-SILENCE-EXEMPT-001 if justified OR fix
4. **Re-scan:** Verify 0 forbidden catches remain
5. **Update:** 55-nonconformities/55-nonconformities-register.md if new exception

---

## Scan B: NO_DIRECT_INVOKE_BYPASS

### Rule
**Authority:** NC-001 (Direct invoke() bypasses secureInvoke)  
**Principle:** All IPC calls MUST go through secureInvoke or tauriClient wrappers

### Forbidden Patterns
```typescript
// 1. Direct import from @tauri-apps/api
import { invoke } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";

// 2. Direct invoke usage (not wrapped)
await invoke('command_name');
invoke('command_name').then(...);
```

### Allowed Patterns
```typescript
// ✅ GOOD: Wrapped usage
import { secureInvoke } from '@/lib/security';
await secureInvoke('command_name', payload);

// ✅ GOOD: tauriClient wrapper
import { tauriClient } from '@/services/tauri';
await tauriClient.invoke('command_name');
```

### Known Violations (Acceptable)
**NC-001 documents 5 locations (P2 severity):**
1. `src/services/cognitive/index.ts:211`
2. `src/hooks/useMemory.ts:128`
3. `src/hooks/useMemory.ts:153`
4. `src/hooks/useMemoryCore.ts:153`
5. Test files (E2E tests - acceptable)

**These are acceptable** because:
- Non-critical operations
- Error handling present
- Documented in NC-001

### Scan Command
```bash
# Find direct invoke imports
rg -n "import.*invoke.*from.*@tauri-apps" src --type ts

# Find invoke usage (filter out secureInvoke/tauriClient)
rg -n "invoke\(" src --type ts | grep -v "secureInvoke\|tauriClient"

# Count violations
rg -c "invoke\(" src --type ts
```

### Expected Result
**PASS Criteria:**
- 0 new violations beyond NC-001 (5 known)
- OR <= 5 total violations (all in NC-001)

### Output Format
| File | Line | Pattern | Classification | Known? |
|------|------|---------|----------------|--------|
| src/hooks/useMemory.ts | 128 | `await invoke('delete_conversation')` | P2 | ✅ NC-001 |
| src/newFile.ts | 45 | `await invoke('new_command')` | P1 | ❌ NEW |

### If Scan FAILS
1. **Count violations:** Should be <= 5 (NC-001)
2. **If > 5:** New violations introduced
3. **Action:**
   - Replace with `secureInvoke` or `tauriClient`
   - Minimal surgical changes
4. **Re-scan:** Verify <= 5 violations
5. **Update:** NC-001 if acceptable new violations found

---

## Scan C: NO_IPC_FETCH

### Rule
**Authority:** TITANE∞ Constitutional (Tauri-only, local-first)  
**Principle:** No fetch("ipc://") - violates Tauri allowlist security

### Forbidden Patterns
```typescript
// ABSOLUTELY FORBIDDEN
fetch("ipc://command");
fetch('ipc://invoke');
const url = "ipc://...";
```

### Scan Command
```bash
# Find any ipc:// fetch usage
rg -n 'fetch\("ipc://' src
rg -n "fetch\('ipc://" src
rg -n 'ipc://' src --type ts
```

### Expected Result
**PASS Criteria:**
- 0 results (no ipc:// fetch found)

### Output Format
| File | Line | Pattern | Severity |
|------|------|---------|----------|
| (none) | - | - | ✅ PASS |

### If Scan FAILS
1. **Severity:** P0 (constitutional violation)
2. **Action:** IMMEDIATE removal/replacement
3. **Replace with:**
   ```typescript
   // Instead of: fetch("ipc://command")
   // Use:
   import { secureInvoke } from '@/lib/security';
   await secureInvoke('command', payload);
   ```
4. **Re-scan:** Must be 0 results
5. **Block merge:** Cannot merge with ipc:// fetch

---

## Scan D: NO_HUMAN_NAME_AUTHORITY

### Rule
**Authority:** GOVERNANCE_RULES.md (GOV-NO-HUMAN-IDENTITY-ATTRIBUTION)  
**Principle:** System authority labels only (no person names)

### Forbidden Patterns
```markdown
Authority: Kevin Thibault
Decision Maker: Kevin
Owner: [person name]
Approved by: [person name]
```

### Allowed Patterns
```markdown
Authority: TITANE∞ Governance
Authority: UI_ARBITRATION_LOG.md
Authority: Protocol vΩ.UI.HYGIENE
Decision Maker: Governance Board
Owner: TITANE∞ Project
```

### Scan Command
```bash
# Scan all docs for Authority/Decision lines
grep -rn "Authority:" docs/ui-carto-copilot/ | grep -v "TITANE\|Protocol\|Governance\|Decision Log\|\.md\|09_MANIFEST"

# Scan for common person name patterns (adjust as needed)
grep -rn "Authority:.*Kevin\|Decision.*Kevin" docs/ui-carto-copilot/
```

### Expected Result
**PASS Criteria:**
- 0 human name authority attributions found
- All Authority/Decision lines use system labels

### Output Format
| File | Line | Pattern | Remediation |
|------|------|---------|-------------|
| example.md | 5 | `Authority: Kevin` | → `Authority: UI_ARBITRATION_LOG.md` |

### If Scan FAILS
1. **Severity:** P1 (governance drift)
2. **Action:** Replace with system label
3. **Remediation:**
   - "Kevin" → "TITANE∞ Governance"
   - Person name → File reference or "Protocol"
4. **Examples:**
   ```markdown
   ❌ Authority: Kevin Thibault
   ✅ Authority: TITANE∞ Governance
   
   ❌ Decision: Kevin approved
   ✅ Authority: UI_ARBITRATION_LOG.md entry P1-1
   
   ❌ Owner: [person]
   ✅ Authority: TITANE∞ Project Governance
   ```
5. **Re-scan:** Must be 0 human name attributions

---

## Scan Execution Workflow

### Weekly Scan (Recommended)
```bash
# 1. Run all 4 scans
./scripts/run-ui-scans.sh  # if script exists

# OR manually:
# 2. A) Silent catch scan
rg -n "} catch" src --type ts > /tmp/scan-a-results.txt

# 3. B) Direct invoke scan
rg -n "invoke\(" src --type ts | grep -v "secureInvoke\|tauriClient" > /tmp/scan-b-results.txt

# 4. C) IPC fetch scan
rg -n 'ipc://' src --type ts > /tmp/scan-c-results.txt

# 5. D) Human name authority scan
grep -rn "Authority:" docs/ui-carto-copilot/ | grep -v "TITANE\|Protocol\|Governance" > /tmp/scan-d-results.txt

# 6. Review results
cat /tmp/scan-*-results.txt

# 7. Log results
echo "Scan Date: $(date)" > docs/ui-carto-copilot/VERIFICATION/SCAN_RESULTS.md
echo "Results: ..." >> docs/ui-carto-copilot/VERIFICATION/SCAN_RESULTS.md
```

### Pre-Commit Scan (Recommended)
```bash
# Quick check before committing UI changes
rg -n "} catch" src --type ts | wc -l
rg -n "invoke\(" src --type ts | grep -v "secureInvoke" | wc -l
rg -n 'ipc://' src --type ts | wc -l
```

---

## Results Logging

**File:** docs/ui-carto-copilot/VERIFICATION/SCAN_RESULTS.md

**Format:**
```markdown
# Anti-Regression Scan Results

**Date:** 2026-02-08  
**Executor:** [agent/human]

## Scan A: NO_EMPTY_OR_SILENT_CATCH
- Status: PASS / FAIL
- Violations: 0 / N
- Exceptions: 6 (NC-UI-SILENCE-EXEMPT-001)
- Details: [table if FAIL]

## Scan B: NO_DIRECT_INVOKE_BYPASS
- Status: PASS / FAIL
- Violations: 5 (NC-001 known) / N
- Details: [table if new violations]

## Scan C: NO_IPC_FETCH
- Status: PASS / FAIL
- Violations: 0 / N
- Details: [table if FAIL]

## Scan D: NO_HUMAN_NAME_AUTHORITY
- Status: PASS / FAIL
- Violations: 0 / N
- Details: [table if FAIL]

## Summary
- Total Issues: N
- Blocking (P0): N
- Action Required: [list]
```

---

## Integration with Freeze Gates

**Gate 13: ANTI_REGRESSION_SCANS_REQUIRED**
- Before major UI changes
- Scans A-D must PASS or violations documented
- Results logged in SCAN_RESULTS.md

**Enforcement:**
- Manual review: Check SCAN_RESULTS.md timestamp
- Automated (optional): CI script runs scans on PR

---

**Status:** ✅ SCAN SPECIFICATIONS TERMINÉ
