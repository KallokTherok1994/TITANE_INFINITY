# P10.3.2: Full Desktop E2E x3 Certification

## Prerequisite
✅ **P10.3.1 Complete**: Selector fix qualified and committed (see CERTIFICATION_REGISTRY_APPEND_ONLY.md)

## Scope
This phase executes the full P10.3 Desktop E2E certification:
- E2E run x3 (independent instances)
- Security scan x3 (no network, no dev server, no real writes)
- Determinism check on all runs

## Required Files (Unchanged from P10.3.1)
- src/components/chat/ChatBubble.tsx (data-testid anchor)
- e2e/desktop/ai-verification.full.e2e.js (updated selectors)
- e2e/desktop/chat-ar20.wdio.test.js (updated selectors)
- src/services/ai/providers/ollama.ts (transport layer)

## Authorization Required
```
GO_START_PHASE_P10_3_2_E2E_X3_FULL_CERT__TITANE_INFINITY
GO_FOR_PROD_SCANS_P10_3_2__TITANE_INFINITY
```

## Execution Commands (Exact)
```bash
# Setup
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
UTC_NOW=$(date -u +"%Y%m%dT%H%M%SZ")
PACK_DIR="deployment/latest/certification/phase10_3_2/P10_3_2_DESKTOP_E2E_X3_${UTC_NOW}"
mkdir -p "$PACK_DIR"

# Run 1
pnpm run e2e:desktop > "$PACK_DIR/E2E_RUN_1.txt" 2>&1
EXIT_1=$?

# Run 2
pnpm run e2e:desktop > "$PACK_DIR/E2E_RUN_2.txt" 2>&1
EXIT_2=$?

# Run 3
pnpm run e2e:desktop > "$PACK_DIR/E2E_RUN_3.txt" 2>&1
EXIT_3=$?

# Security scans (run x1, not x3)
pnpm run guard:ollama-proxy > "$PACK_DIR/GUARD_SCAN.txt" 2>&1

# Determinism check
diff "$PACK_DIR/E2E_RUN_1.txt" "$PACK_DIR/E2E_RUN_2.txt" > "$PACK_DIR/DIFF_RUN1_RUN2.txt" || true
diff "$PACK_DIR/E2E_RUN_2.txt" "$PACK_DIR/E2E_RUN_3.txt" > "$PACK_DIR/DIFF_RUN2_RUN3.txt" || true
```

## Proof Pack Structure (P10.3.2)
```
P10_3_2_DESKTOP_E2E_X3_<UTC>/
  00_SCOPE.md
  01_PRECHECKS.txt
  02_ENVIRONMENT.txt
  
  E2E_RUN_1.txt (logs + exit code)
  E2E_RUN_2.txt (logs + exit code)
  E2E_RUN_3.txt (logs + exit code)
  
  E2E_RESULT.txt (all 3 exit codes)
  E2E_DETERMINISM_CHECK.txt (diff analysis)
  
  GUARD_SCAN.txt (security compliance)
  SECURITY_FINDINGS.txt
  
  VERDICT.md
  LOCK.md
  SHA256SUMS.txt
  COMMANDS_RUN.txt
  ENV.txt
```

## Success Criteria (STOP-THE-LINE if ANY fail)
1. **E2E x3 PASS**: All three runs exit with code 0
2. **Determinism**: Outputs match (or explain differences)
3. **Guard PASS**: ollama-proxy guard passes
4. **No Network**: No external calls detected
5. **No Dev Server**: No Vite/webpack server started
6. **No Real Writes**: All writes to temp/memory directories

## Evidence Requirements
- All three E2E logs captured
- Guard verification log
- Determinism diff output
- Final VERDICT.md with exact status

## Failure Path
If ANY criterion fails:
1. **Root Cause Analysis**: Triage failure
2. **Decision**: Fix or escalate?
3. **Rerun or Stop**: Max 1 retry per criterion
4. **Stop-the-Line**: If unresolvable, seal as FAIL

## Final Verdict Options (P10.3.2)
- ✅ **PASS_DESKTOP_E2E_X3** (all 3 runs + scans + determinism)
- ❌ **FAIL_DESKTOP_E2E_X3_<REASON>** (documented failure)

## Next After P10.3.2
If PASS_DESKTOP_E2E_X3:
- Merge to stable release branch
- Update version / changelog
- Trigger deployment certification (P11)

If FAIL:
- Escalate to engineering
- Schedule bug fix + re-run

---
**Plan Created**: 2026-02-18T13:59:03Z
**Prerequisites**: P10.3.1 QUALIFIED (✅ complete)
**Status**: Ready for authorization & execution
